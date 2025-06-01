
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

    // 2. RSS Feed Scraping for this specific source
    console.log('Step 2: Fetching RSS feed for source...');
    const scrapedContent = await fetchRSSFeed(source);
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

async function fetchRSSFeed(source: any): Promise<RawContent[]> {
  console.log('RSS Feed Parser: Processing source:', source.name, 'URL:', source.url);
  
  try {
    // Fetch the RSS feed
    console.log('Fetching RSS feed from:', source.url);
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Thriphti-Bot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log('RSS feed fetched, length:', xmlText.length);
    
    // Parse the XML content
    const items = await parseRSSXML(xmlText, source);
    console.log(`Parsed ${items.length} items from RSS feed`);
    
    return items;

  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    throw new Error(`Failed to fetch RSS feed: ${error.message}`);
  }
}

async function parseRSSXML(xmlText: string, source: any): Promise<RawContent[]> {
  const items: RawContent[] = [];
  
  try {
    // Basic XML parsing - extract items between <item> tags
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const itemMatches = xmlText.match(itemRegex) || [];
    
    console.log(`Found ${itemMatches.length} items in RSS feed`);
    
    for (const itemXML of itemMatches) {
      try {
        const item = parseRSSItem(itemXML, source);
        if (item) {
          items.push(item);
        }
      } catch (error) {
        console.error('Error parsing RSS item:', error);
        // Continue with other items
      }
    }
    
    return items;
    
  } catch (error) {
    console.error('Error parsing RSS XML:', error);
    return [];
  }
}

function parseRSSItem(itemXML: string, source: any): RawContent | null {
  try {
    // Extract basic fields using regex
    const title = extractXMLField(itemXML, 'title');
    const description = extractXMLField(itemXML, 'description') || extractXMLField(itemXML, 'content:encoded');
    const link = extractXMLField(itemXML, 'link') || extractXMLField(itemXML, 'guid');
    const pubDate = extractXMLField(itemXML, 'pubDate') || extractXMLField(itemXML, 'published');
    
    if (!title) {
      console.log('Skipping item without title');
      return null;
    }
    
    // Clean up description (remove HTML tags)
    const cleanDescription = description 
      ? description.replace(/<[^>]*>/g, '').trim()
      : '';
    
    // Format date
    let formattedDate = '';
    if (pubDate) {
      try {
        const date = new Date(pubDate);
        formattedDate = date.toISOString().split('T')[0];
      } catch (e) {
        console.log('Could not parse date:', pubDate);
      }
    }
    
    console.log('Parsed RSS item:', { title: title.substring(0, 50), hasDescription: !!cleanDescription });
    
    return {
      title: title.trim(),
      description: cleanDescription,
      location: 'Dallas, TX', // Default for Dallas subreddit
      date: formattedDate || new Date().toISOString().split('T')[0],
      url: link,
      price: '', // Will be extracted by AI if relevant
      type: source.category || 'reddit_post',
      source: source.name,
      scraped_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error parsing RSS item:', error);
    return null;
  }
}

function extractXMLField(xml: string, fieldName: string): string {
  // Try CDATA format first
  const cdataRegex = new RegExp(`<${fieldName}[^>]*><!\\[CDATA\\[(.*?)\\]\\]><\/${fieldName}>`, 'si');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) {
    return cdataMatch[1];
  }
  
  // Try regular format
  const regularRegex = new RegExp(`<${fieldName}[^>]*>(.*?)<\/${fieldName}>`, 'si');
  const regularMatch = xml.match(regularRegex);
  if (regularMatch) {
    return regularMatch[1];
  }
  
  // Try self-closing tag with content
  const selfClosingRegex = new RegExp(`<${fieldName}[^>]*>([^<]*?)(?=<)`, 'si');
  const selfClosingMatch = xml.match(selfClosingRegex);
  if (selfClosingMatch) {
    return selfClosingMatch[1];
  }
  
  return '';
}

async function aiContentProcessor(rawContent: RawContent[], openAIApiKey: string): Promise<ProcessedContent[]> {
  console.log('AI Content Processor: Starting with', rawContent.length, 'raw items');
  
  if (!openAIApiKey) {
    console.log('No OpenAI key, creating basic processed content without AI');
    return rawContent.map((item, index) => ({
      id: `processed_${index}_${Date.now()}`,
      title: item.title,
      description: item.description,
      category: determineCategory(item.title + ' ' + item.description),
      location: item.location || 'Dallas, TX',
      relevance_score: calculateBasicRelevance(item.title + ' ' + item.description),
      actionable_details: `${item.location || 'Dallas area'} - ${item.date || 'Recent post'}`,
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
1. Filter for Dallas-Fort Worth area content only
2. Score relevance to thrifting/secondhand shopping (1-10)
3. Remove duplicates and spam
4. Categorize: garage_sale, estate_sale, thrift_store, flea_market, vintage_shop, tips, news, community
5. Extract actionable details (locations, times, special items, prices if mentioned)

Only keep items with relevance ≥ 5. Look for keywords like: thrift, vintage, secondhand, garage sale, estate sale, consignment, flea market, yard sale, resale, antique, used items, etc.

Return JSON array with: {id, title, description, category, location, relevance_score, actionable_details, date, source_data}`
        }, {
          role: 'user',
          content: `Process this raw content:\n\n${JSON.stringify(rawContent.slice(0, 10))}` // Limit to 10 items per batch
        }],
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error in processing:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI processing response length:', data.choices?.[0]?.message?.content?.length || 0);
    
    const processed = JSON.parse(data.choices[0].message.content || '[]');
    
    // Filter for relevance >= 5 and add unique IDs
    const filtered = processed
      .filter((item: any) => item.relevance_score >= 5)
      .map((item: any) => ({
        ...item,
        id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));
    
    console.log(`AI Content Processor: Filtered to ${filtered.length} items (relevance >= 5)`);
    
    return filtered;

  } catch (error) {
    console.error('Error in AI content processing:', error);
    // Fallback to basic processing
    return rawContent.map((item, index) => ({
      id: `processed_${index}_${Date.now()}`,
      title: item.title,
      description: item.description,
      category: determineCategory(item.title + ' ' + item.description),
      location: item.location || 'Dallas, TX',
      relevance_score: calculateBasicRelevance(item.title + ' ' + item.description),
      actionable_details: `${item.location || 'Dallas area'} - ${item.date || 'Recent post'}`,
      date: item.date,
      source_data: item
    }));
  }
}

function determineCategory(content: string): string {
  const lower = content.toLowerCase();
  
  if (lower.includes('garage sale') || lower.includes('yard sale')) return 'garage_sale';
  if (lower.includes('estate sale')) return 'estate_sale';
  if (lower.includes('thrift store') || lower.includes('thrift shop')) return 'thrift_store';
  if (lower.includes('flea market')) return 'flea_market';
  if (lower.includes('vintage') || lower.includes('antique')) return 'vintage_shop';
  if (lower.includes('consignment')) return 'thrift_store';
  if (lower.includes('tips') || lower.includes('advice') || lower.includes('guide')) return 'tips';
  
  return 'community';
}

function calculateBasicRelevance(content: string): number {
  const lower = content.toLowerCase();
  let score = 0;
  
  // Thrift-related keywords
  const thriftKeywords = ['thrift', 'vintage', 'secondhand', 'garage sale', 'estate sale', 'consignment', 'flea market', 'yard sale', 'resale', 'antique', 'used'];
  const keywordMatches = thriftKeywords.filter(keyword => lower.includes(keyword)).length;
  score += keywordMatches * 2;
  
  // Dallas area mentions
  const dallasKeywords = ['dallas', 'dfw', 'fort worth', 'plano', 'frisco', 'richardson', 'garland', 'mesquite'];
  const locationMatches = dallasKeywords.filter(location => lower.includes(location)).length;
  score += locationMatches * 1;
  
  // Cap at 10
  return Math.min(score, 10);
}

async function saveToContentPipeline(supabase: any, processedContent: ProcessedContent[], sourceId: string): Promise<any[]> {
  console.log('Save Content Pipeline: Starting...');
  const savedItems = [];

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
        console.log(`Saved pipeline item: ${pipelineData.id} - ${processed.title.substring(0, 50)}...`);
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
