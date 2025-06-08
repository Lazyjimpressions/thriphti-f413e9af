
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { apiType } = await req.json()

    if (apiType === 'openai') {
      const openaiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openaiKey) {
        throw new Error('OpenAI API key not configured')
      }

      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (apiType === 'firecrawl') {
      const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY')
      if (!firecrawlKey) {
        throw new Error('Firecrawl API key not configured')
      }

      const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
        }),
      })

      if (!response.ok) {
        throw new Error(`Firecrawl API error: ${response.status}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Invalid API type')

  } catch (error) {
    console.error('API connection test failed:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
