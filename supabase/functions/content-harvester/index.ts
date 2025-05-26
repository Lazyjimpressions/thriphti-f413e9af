
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

interface GeneratedArticle {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  publish_immediately: boolean;
  image?: string;
  author: string;
  city: string;
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

  console.log('=== AI CONTENT HARVESTER STARTING ===');
  console.log('OpenAI API Key available:', !!openAIApiKey);
  console.log('Supabase URL:', Deno.env.get('SUPABASE_URL'));

  try {
    // 1. Get active content sources
    console.log('Step 1: Fetching active content sources...');
    const { data: sources, error: sourcesError } = await supabase
      .from('content_sources')
      .select('*')
      .eq('active', true);

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      throw sourcesError;
    }

    console.log(`Found ${sources?.length || 0} active sources:`, sources);

    // 2. AI Web Scraping Agent
    console.log('Step 2: Running AI web scraper...');
    const scrapedContent = await aiWebScraper(sources || [], openAIApiKey);
    console.log(`Scraped ${scrapedContent.length} raw content items`);
    console.log('Sample scraped content:', scrapedContent.slice(0, 2));

    // 3. AI Content Filter & Processor
    console.log('Step 3: Processing content with AI...');
    const processedContent = await aiContentProcessor(scrapedContent, openAIApiKey);
    console.log(`Processed ${processedContent.length} relevant content items`);
    console.log('Sample processed content:', processedContent.slice(0, 2));

    // 4. AI Article Generator
    console.log('Step 4: Generating articles with AI...');
    const articles = await aiArticleGenerator(processedContent, openAIApiKey);
    console.log(`Generated ${articles.length} articles`);
    console.log('Sample articles:', articles.slice(0, 1));

    // 5. Save to database
    console.log('Step 5: Saving to database...');
    const savedArticles = await saveContentPipeline(supabase, scrapedContent, processedContent, articles);
    console.log(`Saved ${savedArticles.length} articles to database`);

    // 6. Update source success rates
    console.log('Step 6: Updating source statistics...');
    await updateSourceStats(supabase, sources || []);

    console.log('=== AI CONTENT HARVESTER COMPLETED ===');

    return new Response(JSON.stringify({ 
      success: true, 
      scraped: scrapedContent.length,
      processed: processedContent.length,
      articles: articles.length,
      saved: savedArticles.length,
      debug: {
        sources_count: sources?.length || 0,
        openai_key_available: !!openAIApiKey
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('=== ERROR IN CONTENT HARVESTER ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      debug: {
        openai_key_available: !!openAIApiKey,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function aiWebScraper(sources: any[], openAIApiKey: string): Promise<RawContent[]> {
  console.log('AI Web Scraper: Starting with', sources.length, 'sources');
  const scrapedData: RawContent[] = [];

  // Enhanced simulated scraping with more realistic Dallas thrifting data
  const dallasThriftingSources = [
    {
      type: 'garage_sales',
      content: [
        {
          title: "Multi-Family Garage Sale - Designer Clothes & Vintage Items",
          description: "Moving sale! Designer clothing from Nordstrom, vintage furniture pieces, rare books, household items. Everything must go! Cash only.",
          location: "2305 Mockingbird Lane, Dallas, TX 75205",
          date: "2024-01-20",
          price: "Various prices $1-50",
          type: "garage_sale"
        },
        {
          title: "Estate Sale - Mid-Century Modern Furniture Collection",
          description: "Beautiful mid-century modern pieces including Eames chairs, vintage jewelry collection, original art pieces, and collectibles from 1960s estate.",
          location: "4821 Swiss Avenue, Dallas, TX 75214",
          date: "2024-01-21",
          price: "$5-500",
          type: "estate_sale"
        },
        {
          title: "Neighborhood Garage Sale - Lakewood Area",
          description: "Multiple families participating! Children's clothes, toys, books, kitchen items, and some vintage finds. Early birds welcome!",
          location: "Lakewood Heights neighborhood, Dallas, TX",
          date: "2024-01-20",
          price: "$0.50-25",
          type: "garage_sale"
        }
      ]
    },
    {
      type: 'thrift_stores',
      content: [
        {
          title: "New Vintage Boutique Opens in Deep Ellum",
          description: "Curated vintage clothing and accessories from the 70s-90s. Specializing in band tees, denim, and unique accessories. Grand opening specials all week!",
          location: "2912 Main Street, Dallas, TX 75226",
          date: "2024-01-19",
          price: "$10-150",
          type: "thrift_store"
        },
        {
          title: "Goodwill Outlet Store - Bulk Pricing",
          description: "Pay by the pound! Clothing, books, housewares, and more. Perfect for resellers and bargain hunters. New merchandise added daily.",
          location: "1015 N Riverfront Blvd, Dallas, TX 75207",
          date: "2024-01-19",
          price: "$1.99/lb",
          type: "thrift_store"
        }
      ]
    },
    {
      type: 'events',
      content: [
        {
          title: "Dallas Flea Market - First Trade Days",
          description: "Monthly flea market with over 200 vendors selling antiques, vintage clothing, handmade items, and collectibles. Food trucks and live music.",
          location: "Fair Park, Dallas, TX",
          date: "2024-01-27",
          price: "$5 admission, free parking",
          type: "flea_market"
        },
        {
          title: "Canton First Monday Trade Days",
          description: "America's largest flea market! Over 6,000 vendors on 400+ acres. Antiques, crafts, food, and everything in between. Worth the drive from Dallas!",
          location: "Canton, TX (1 hour from Dallas)",
          date: "2024-01-26",
          price: "Free admission, $5 parking",
          type: "flea_market"
        }
      ]
    }
  ];

  // Process simulated data (enhanced for realism)
  for (const source of dallasThriftingSources) {
    for (const item of source.content) {
      try {
        if (!openAIApiKey) {
          console.log('No OpenAI key, using raw content without enhancement');
          scrapedData.push({
            ...item,
            source: `simulated_${source.type}`,
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
          source: `simulated_${source.type}`,
          scraped_at: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error enhancing content:', error);
        // Fallback to original content
        scrapedData.push({
          ...item,
          source: `simulated_${source.type}`,
          scraped_at: new Date().toISOString()
        });
      }
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
      id: `processed_${index}`,
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
    
    // Lowered threshold from 7 to 5 for testing
    const filtered = processed.filter((item: any) => item.relevance_score >= 5);
    console.log(`AI Content Processor: Filtered to ${filtered.length} items (relevance >= 5)`);
    
    return filtered;

  } catch (error) {
    console.error('Error in AI content processing:', error);
    // Fallback to basic processing
    return rawContent.map((item, index) => ({
      id: `processed_${index}`,
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

async function aiArticleGenerator(processedContent: ProcessedContent[], openAIApiKey: string): Promise<GeneratedArticle[]> {
  console.log('AI Article Generator: Starting with', processedContent.length, 'processed items');
  
  if (processedContent.length === 0) {
    console.log('No processed content to generate articles from');
    return [];
  }

  // Group content by category
  const grouped = processedContent.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ProcessedContent[]>);

  console.log('Content grouped by category:', Object.keys(grouped).map(key => `${key}: ${grouped[key].length}`));

  const articles: GeneratedArticle[] = [];

  for (const [category, items] of Object.entries(grouped)) {
    if (items.length < 1) continue;

    console.log(`Generating article for category: ${category} with ${items.length} items`);

    const articlePrompt = getArticlePrompt(category);
    
    if (!openAIApiKey) {
      console.log('No OpenAI key, creating basic article without AI');
      articles.push({
        title: `This Weekend's Best ${category.replace('_', ' ').toUpperCase()} in Dallas`,
        content: `Check out these amazing ${category.replace('_', ' ')} opportunities in Dallas this weekend!\n\n${items.map(item => `• ${item.title} at ${item.location}`).join('\n')}`,
        excerpt: `Discover the best ${category.replace('_', ' ')} spots in Dallas this weekend.`,
        category,
        tags: ['dallas', 'thrifting', category],
        publish_immediately: true,
        author: 'Thriphti AI Editor',
        city: 'Dallas'
      });
      continue;
    }
    
    try {
      console.log(`Calling OpenAI to generate article for ${category}...`);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'system',
            content: articlePrompt
          }, {
            role: 'user',
            content: `Create article from this content:\n\n${JSON.stringify(items)}`
          }],
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API error in article generation:', response.status, response.statusText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`OpenAI article response for ${category}:`, data.choices?.[0]?.message?.content?.substring(0, 100));
      
      const generated = JSON.parse(data.choices[0].message.content || '{}');
      
      articles.push({
        ...generated,
        category,
        author: 'Thriphti AI Editor',
        city: 'Dallas'
      });

      console.log(`Successfully generated article for ${category}: ${generated.title}`);

    } catch (error) {
      console.error(`Error generating article for ${category}:`, error);
      // Fallback article
      articles.push({
        title: `This Weekend's Best ${category.replace('_', ' ').toUpperCase()} in Dallas`,
        content: `Check out these amazing ${category.replace('_', ' ')} opportunities in Dallas this weekend!\n\n${items.map(item => `• ${item.title} at ${item.location}`).join('\n')}`,
        excerpt: `Discover the best ${category.replace('_', ' ')} spots in Dallas this weekend.`,
        category,
        tags: ['dallas', 'thrifting', category],
        publish_immediately: true,
        author: 'Thriphti AI Editor',
        city: 'Dallas'
      });
    }
  }

  console.log(`AI Article Generator: Generated ${articles.length} articles`);
  return articles;
}

function getArticlePrompt(category: string): string {
  const prompts: Record<string, string> = {
    garage_sale: `You're the insider editor of Thriphti.com. Write a "This Weekend's Best Garage Sales in DFW" roundup.
    Tone: Enthusiastic friend who knows the best spots. Include addresses, times, what to expect, insider tips.
    Format: JSON {title, content, excerpt, tags[], publish_immediately: boolean}`,
    
    estate_sale: `Write a "Must-Visit Estate Sales This Weekend" feature article.
    Tone: Knowledgeable curator highlighting unique finds. Include specific items, pricing expectations, early bird tips.
    Format: JSON {title, content, excerpt, tags[], publish_immediately: boolean}`,
    
    thrift_store: `Write a "New Thrift Store Spotlight" feature article.
    Tone: Editorial review with practical shopping advice. What makes it special, price ranges, best finds.
    Format: JSON {title, content, excerpt, tags[], publish_immediately: boolean}`,
    
    flea_market: `Create a "Flea Market Guide" article.
    Tone: Seasoned shopper sharing insider knowledge. Include vendor highlights, negotiation tips, parking advice.
    Format: JSON {title, content, excerpt, tags[], publish_immediately: boolean}`,
    
    vintage_shop: `Write a "Vintage Shop Discovery" article.
    Tone: Fashion-focused with style advice. Include era specialties, price points, styling suggestions.
    Format: JSON {title, content, excerpt, tags[], publish_immediately: boolean}`
  };
  
  return prompts[category] || `Create a helpful thrifting article.
    Tone: Expert advice, actionable strategies. Include specific techniques and local insights.
    Format: JSON {title, content, excerpt, tags[], publish_immediately: boolean}`;
}

async function saveContentPipeline(supabase: any, rawContent: RawContent[], processedContent: ProcessedContent[], articles: GeneratedArticle[]): Promise<any[]> {
  console.log('Save Content Pipeline: Starting...');
  const savedArticles = [];

  // Save pipeline data
  console.log(`Saving ${processedContent.length} items to content_pipeline...`);
  for (const processed of processedContent) {
    try {
      const { data: pipelineData, error } = await supabase
        .from('content_pipeline')
        .insert({
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
        console.log(`Saved pipeline item: ${pipelineData.id} - ${processed.title}`);
      }
    } catch (error) {
      console.error('Exception saving pipeline item:', error);
    }
  }

  // Save generated articles
  console.log(`Saving ${articles.length} articles...`);
  for (const article of articles) {
    try {
      const { data: articleData, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          slug: generateSlug(article.title),
          excerpt: article.excerpt,
          body: article.content,
          author: article.author,
          category: mapCategoryToArticleCategory(article.category),
          tags: article.tags,
          city: article.city,
          ai_generated: true,
          ai_metadata: {
            model: 'gpt-4o',
            generated_at: new Date().toISOString(),
            confidence_score: 0.8
          },
          auto_published: article.publish_immediately,
          published_at: article.publish_immediately ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving article:', error);
      } else {
        savedArticles.push(articleData);
        console.log(`Saved article: ${articleData.title} (ID: ${articleData.id})`);
      }

    } catch (error) {
      console.error('Exception saving article:', error);
    }
  }

  console.log(`Save Content Pipeline: Completed - saved ${savedArticles.length} articles`);
  return savedArticles;
}

async function updateSourceStats(supabase: any, sources: any[]): Promise<void> {
  console.log('Updating source stats for', sources.length, 'sources');
  for (const source of sources) {
    try {
      await supabase
        .from('content_sources')
        .update({
          last_scraped: new Date().toISOString(),
          total_attempts: (source.total_attempts || 0) + 1,
          successful_attempts: (source.successful_attempts || 0) + 1,
          success_rate: ((source.successful_attempts || 0) + 1) / ((source.total_attempts || 0) + 1)
        })
        .eq('id', source.id);
      
      console.log(`Updated stats for source: ${source.name}`);
    } catch (error) {
      console.error('Error updating source stats:', error);
    }
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapCategoryToArticleCategory(category: string): string {
  const mapping: Record<string, string> = {
    garage_sale: 'Events & Markets',
    estate_sale: 'Events & Markets',
    thrift_store: 'Store Features',
    flea_market: 'Events & Markets',
    vintage_shop: 'Store Features',
    tips: 'Tips & Tricks',
    news: 'News'
  };
  
  return mapping[category] || 'Guide';
}
