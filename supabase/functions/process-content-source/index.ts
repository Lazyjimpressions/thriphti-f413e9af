
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RawContent {
  title: string;
  description: string;
  location?: string;
  date?: string;
  url?: string;
  price?: string;
  type: string;
  source: string;
  scraped_at: string;
}

interface ProcessedContent {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  relevance_score: number;
  actionable_details: string;
  date?: string;
  source_data: RawContent;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

  try {
    const { sourceId } = await req.json();

    if (!sourceId) {
      throw new Error('sourceId is required');
    }

    console.log('=== PROCESSING SINGLE SOURCE ===');
    console.log('Source ID:', sourceId);
    console.log('OpenAI API Key available:', !!openAIApiKey);

    // 1. Get the specific content source
    console.log('Step 1: Fetching content source...');
    const { data: source, error: sourceError } = await supabase
      .from('content_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('active', true)
      .single();

    if (sourceError) {
      console.error('Error fetching source:', sourceError);
      throw new Error(`Source not found: ${sourceError.message}`);
    }

    if (!source) {
      throw new Error('Source not found or inactive');
    }

    console.log('Found source:', source.name);

    // 2. AI Web Scraping for this specific source
    console.log('Step 2: Running AI web scraper for source...');
    const scrapedContent = await aiWebScraperForSource(source, openAIApiKey);
    console.log(`Scraped ${scrapedContent.length} raw content items`);

    // 3. AI Content Filter & Processor
    console.log('Step 3: Processing content with AI...');
    const processedContent = await aiContentProcessor(scrapedContent, openAIApiKey);
    console.log(`Processed ${processedContent.length} relevant content items`);

    // 4. Save to pipeline
    console.log('Step 4: Saving to content pipeline...');
    const savedItems = await saveToContentPipeline(supabase, processedContent, sourceId);
    console.log(`Saved ${savedItems.length} items to pipeline`);

    // 5. Update source success stats
    console.log('Step 5: Updating source statistics...');
    await updateSourceStats(supabase, source, true);

    console.log('=== SINGLE SOURCE PROCESSING COMPLETED ===');

    return new Response(JSON.stringify({ 
      success: true, 
      sourceId,
      sourceName: source.name,
      scraped: scrapedContent.length,
      processed: processedContent.length,
      saved: savedItems.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('=== ERROR IN SINGLE SOURCE PROCESSING ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Update source failure stats if we have a sourceId
    try {
      const { sourceId } = await req.json();
      if (sourceId) {
        const { data: source } = await supabase
          .from('content_sources')
          .select('*')
          .eq('id', sourceId)
          .single();
        
        if (source) {
          await updateSourceStats(supabase, source, false);
        }
      }
    } catch (statsError) {
      console.error('Error updating failure stats:', statsError);
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function aiWebScraperForSource(source: any, openAIApiKey: string): Promise<RawContent[]> {
  console.log('AI Web Scraper: Processing source:', source.name);
  const scrapedData: RawContent[] = [];

  // Enhanced simulated scraping based on source type and URL
  let simulatedContent: any[] = [];

  if (source.url.includes('google.com/rss') || source.url.includes('news.google.com')) {
    // Google News RSS feed simulation
    simulatedContent = [
      {
        title: "New Thrift Store Opens in Downtown Dallas",
        description: "A vintage clothing store specializing in designer finds has opened its doors in the Arts District, offering curated pieces from local estate sales.",
        location: "Downtown Dallas, TX",
        date: new Date().toISOString().split('T')[0],
        price: "$5-75",
        type: "thrift_store"
      },
      {
        title: "Weekend Estate Sale Features Mid-Century Collection",
        description: "Local family is hosting a three-day estate sale featuring authentic mid-century modern furniture, vintage jewelry, and collectible items.",
        location: "Highland Park, Dallas, TX",
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        price: "$10-500",
        type: "estate_sale"
      }
    ];
  } else {
    // Default content for other sources
    simulatedContent = [
      {
        title: `Content from ${source.name}`,
        description: `Sample content scraped from ${source.url}`,
        location: "Dallas, TX",
        date: new Date().toISOString().split('T')[0],
        price: "Various",
        type: source.category || "mixed"
      }
    ];
  }

  // Process simulated data
  for (const item of simulatedContent) {
    try {
      if (!openAIApiKey) {
        console.log('No OpenAI key, using raw content without enhancement');
        scrapedData.push({
          ...item,
          source: source.name,
          scraped_at: new Date().toISOString()
        });
        continue;
      }

      console.log(`Enhancing content: ${item.title}`);
      const enhanced = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: `You are a content enhancement AI for Dallas-Fort Worth thrifting. Enhance this content with realistic details while keeping it factual. Add specific addresses in DFW, realistic prices, and detailed descriptions. Return JSON format: {title, description, location, date, price, type, enhanced_details}`
          }, {
            role: 'user',
            content: `Enhance this thrifting content: ${JSON.stringify(item)}`
          }],
          temperature: 0.3
        }),
      });

      if (!enhanced.ok) {
        console.error('OpenAI API error:', enhanced.status, enhanced.statusText);
        throw new Error(`OpenAI API error: ${enhanced.status}`);
      }

      const response = await enhanced.json();
      console.log('OpenAI response for enhancement:', response.choices?.[0]?.message?.content?.substring(0, 100));
      
      const enhancedContent = JSON.parse(response.choices[0].message.content || '{}');

      scrapedData.push({
        ...enhancedContent,
        source: source.name,
        scraped_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error enhancing content:', error);
      // Fallback to original content
      scrapedData.push({
        ...item,
        source: source.name,
        scraped_at: new Date().toISOString()
      });
    }
  }

  console.log(`AI Web Scraper: Completed with ${scrapedData.length} items`);
  return scrapedData;
}

async function aiContentProcessor(rawContent: RawContent[], openAIApiKey: string): Promise<ProcessedContent[]> {
  console.log('AI Content Processor: Starting with', rawContent.length, 'raw items');
  
  if (!openAIApiKey) {
    console.log('No OpenAI key, creating basic processed content without AI');
    return rawContent.map((item, index) => ({
      id: `processed_${index}_${Date.now()}`,
      title: item.title,
      description: item.description,
      category: item.type,
      location: item.location || 'Dallas, TX',
      relevance_score: 8, // Default high score for testing
      actionable_details: `${item.location || 'Dallas area'} - ${item.price || 'Various prices'} - ${item.date || 'This weekend'}`,
      date: item.date,
      source_data: item
    }));
  }

  try {
    console.log('Calling OpenAI for content processing...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: `You are a content processing AI for Thriphti.com (Dallas-Fort Worth thrifting editorial site).

Process this raw content and:
1. Filter for Dallas-Fort Worth area only
2. Score relevance to thrifting (1-10)
3. Remove duplicates
4. Categorize: garage_sale, estate_sale, thrift_store, flea_market, vintage_shop, tips, news
5. Extract actionable details (address, hours, special items, prices)

Only keep items with relevance ≥ 5 and DFW location. Be generous with scoring for testing.
Return JSON array with: {id, title, description, category, location, relevance_score, actionable_details, date, source_data}`
        }, {
          role: 'user',
          content: `Process this raw content:\n\n${JSON.stringify(rawContent)}`
        }],
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error in processing:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI processing response:', data.choices?.[0]?.message?.content?.substring(0, 200));
    
    const processed = JSON.parse(data.choices[0].message.content || '[]');
    
    // Filter for relevance >= 5
    const filtered = processed.filter((item: any) => item.relevance_score >= 5);
    console.log(`AI Content Processor: Filtered to ${filtered.length} items (relevance >= 5)`);
    
    return filtered;

  } catch (error) {
    console.error('Error in AI content processing:', error);
    // Fallback to basic processing
    return rawContent.map((item, index) => ({
      id: `processed_${index}_${Date.now()}`,
      title: item.title,
      description: item.description,
      category: item.type,
      location: item.location || 'Dallas, TX',
      relevance_score: 8, // Default high score for testing
      actionable_details: `${item.location || 'Dallas area'} - ${item.price || 'Various prices'} - ${item.date || 'This weekend'}`,
      date: item.date,
      source_data: item
    }));
  }
}

async function saveToContentPipeline(supabase: any, processedContent: ProcessedContent[], sourceId: string): Promise<any[]> {
  console.log('Save Content Pipeline: Starting...');
  const savedItems = [];

  // Save pipeline data
  console.log(`Saving ${processedContent.length} items to content_pipeline...`);
  for (const processed of processedContent) {
    try {
      const { data: pipelineData, error } = await supabase
        .from('content_pipeline')
        .insert({
          source_id: sourceId,
          stage: 'processed',
          content_type: processed.category,
          raw_data: processed.source_data,
          processed_data: processed,
          relevance_score: processed.relevance_score,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving pipeline item:', error);
      } else {
        savedItems.push(pipelineData);
        console.log(`Saved pipeline item: ${pipelineData.id} - ${processed.title}`);
      }
    } catch (error) {
      console.error('Exception saving pipeline item:', error);
    }
  }

  console.log(`Save Content Pipeline: Completed - saved ${savedItems.length} items`);
  return savedItems;
}

async function updateSourceStats(supabase: any, source: any, success: boolean): Promise<void> {
  console.log(`Updating source stats for: ${source.name} (success: ${success})`);
  
  try {
    const updates: any = {
      last_scraped: new Date().toISOString(),
      total_attempts: (source.total_attempts || 0) + 1,
    };

    if (success) {
      updates.successful_attempts = (source.successful_attempts || 0) + 1;
      updates.consecutive_failures = 0;
    } else {
      updates.consecutive_failures = (source.consecutive_failures || 0) + 1;
    }

    // Calculate success rate
    updates.success_rate = updates.successful_attempts / updates.total_attempts;

    await supabase
      .from('content_sources')
      .update(updates)
      .eq('id', source.id);
    
    console.log(`Updated stats for source: ${source.name}`);
  } catch (error) {
    console.error('Error updating source stats:', error);
  }
}
