import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY')
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

interface StoreAnalysisResult {
  success: boolean;
  error?: string;
  storeData?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Analyzing store website:', url)

    // Step 1: Scrape the website using Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
        includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'div', 'span', 'address'],
        excludeTags: ['script', 'style', 'nav', 'footer', 'header'],
        onlyMainContent: true,
      }),
    })

    if (!scrapeResponse.ok) {
      throw new Error(`Firecrawl API error: ${scrapeResponse.status}`)
    }

    const scrapeData = await scrapeResponse.json()
    
    if (!scrapeData.success) {
      throw new Error(`Failed to scrape website: ${scrapeData.error}`)
    }

    console.log('Website scraped successfully')

    // Step 2: Analyze content with OpenAI
    const analysisPrompt = buildAnalysisPrompt(scrapeData.data, url)

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing thrift store, consignment shop, and vintage store websites. Extract structured information and return valid JSON only. Do not include any markdown formatting, code blocks, or explanatory text - return only the raw JSON object.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiResult = await openaiResponse.json()
    let content = openaiResult.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content returned from OpenAI')
    }

    console.log('Raw OpenAI response:', content)

    // Clean up the response to extract JSON
    content = content.trim()
    
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    // Remove any leading/trailing whitespace again
    content = content.trim()

    console.log('Cleaned content for parsing:', content)

    // Parse the JSON response
    let analysisData
    try {
      analysisData = JSON.parse(content)
    } catch (parseError) {
      console.error('JSON parsing failed. Content:', content)
      console.error('Parse error:', parseError)
      throw new Error(`Failed to parse OpenAI response as JSON: ${parseError.message}`)
    }
    
    // Validate the store is in Dallas-Fort Worth area
    if (!isDallasArea(analysisData.city, analysisData.state)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Store is not located in the Dallas-Fort Worth metroplex' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        storeData: analysisData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Store analysis failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function buildAnalysisPrompt(scrapedData: any, url: string): string {
  return `
Analyze this thrift/consignment/vintage store website and extract structured information. 
Website URL: ${url}
Website Title: ${scrapedData.metadata?.title || 'Unknown'}
Website Description: ${scrapedData.metadata?.description || 'None'}

Content:
${scrapedData.markdown}

Extract and return ONLY valid JSON with this exact structure (no markdown formatting, no code blocks, no explanatory text):
{
  "name": "Store name",
  "description": "Compelling 2-3 sentence description highlighting what makes this store unique",
  "category": ["thrift", "consignment", "vintage", "designer", "furniture", "books", "clothing"],
  "address": "Street address",
  "city": "City name",
  "state": "State abbreviation",
  "zip": "ZIP code",
  "phone": "Phone number",
  "website": "${url}",
  "hours": {
    "monday": {"open": "09:00", "close": "18:00"},
    "tuesday": {"open": "09:00", "close": "18:00"}
  },
  "specialties": ["vintage clothing", "designer items", "furniture", "books"],
  "priceRange": "budget-friendly",
  "features": ["large selection", "frequent sales", "accepts donations"],
  "confidence": 0.85,
  "images": ["url1", "url2"]
}

Rules:
- Only include stores in Texas, preferably Dallas-Fort Worth area
- Categories: choose from thrift, consignment, vintage, designer, furniture, books, clothing, accessories
- Hours: use 24-hour format (HH:MM), only include days found on website
- Confidence: 0.0-1.0 based on information completeness
- Description: focus on unique aspects, specialties, and what shoppers can expect
- Extract any images from the website content
- If critical information is missing, use null but maintain JSON structure
- Return ONLY the JSON object, no other text or formatting
`
}

function isDallasArea(city?: string, state?: string): boolean {
  if (!city || !state) return false
  
  if (state.toLowerCase() !== 'tx' && state.toLowerCase() !== 'texas') {
    return false
  }

  const dallasAreaCities = [
    'dallas', 'fort worth', 'arlington', 'plano', 'garland', 'irving', 'grand prairie',
    'mesquite', 'carrollton', 'richardson', 'lewisville', 'allen', 'flower mound',
    'frisco', 'mckinney', 'denton', 'euless', 'bedford', 'grapevine', 'southlake',
    'colleyville', 'keller', 'coppell', 'farmers branch', 'university park',
    'highland park', 'addison', 'cedar hill', 'desoto', 'duncanville', 'lancaster',
    'rowlett', 'wylie', 'rockwall', 'murphy', 'sachse', 'balch springs'
  ]

  return dallasAreaCities.some(dallasCity => 
    city.toLowerCase().includes(dallasCity) || dallasCity.includes(city.toLowerCase())
  )
}
