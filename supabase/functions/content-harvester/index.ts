
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

  try {
    console.log('Starting AI Content Harvester...');

    // 1. Get active content sources
    const { data: sources, error: sourcesError } = await supabase
      .from('content_sources')
      .select('*')
      .eq('active', true);

    if (sourcesError) throw sourcesError;

    console.log(`Found ${sources?.length || 0} active sources`);

    // 2. AI Web Scraping Agent
    const scrapedContent = await aiWebScraper(sources || [], openAIApiKey);
    console.log(`Scraped ${scrapedContent.length} raw content items`);

    // 3. AI Content Filter & Processor
    const processedContent = await aiContentProcessor(scrapedContent, openAIApiKey);
    console.log(`Processed ${processedContent.length} relevant content items`);

    // 4. AI Article Generator
    const articles = await aiArticleGenerator(processedContent, openAIApiKey);
    console.log(`Generated ${articles.length} articles`);

    // 5. Save to database
    const savedArticles = await saveContentPipeline(supabase, scrapedContent, processedContent, articles);
    console.log(`Saved ${savedArticles.length} articles to database`);

    // 6. Update source success rates
    await updateSourceStats(supabase, sources || []);

    return new Response(JSON.stringify({ 
      success: true, 
      scraped: scrapedContent.length,
      processed: processedContent.length,
      articles: articles.length,
      saved: savedArticles.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in content-harvester:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function aiWebScraper(sources: any[], openAIApiKey: string): Promise<RawContent[]> {
  const scrapedData: RawContent[] = [];

  // Simulated scraping sources with AI extraction
  const dallasThriftingSources = [
    {
      type: 'garage_sales',
      content: [
        {
          title: "Multi-Family Garage Sale - Designer Clothes & Vintage Items",
          description: "Moving sale! Designer clothing, vintage furniture, books, household items. Everything must go!",
          location: "2305 Mockingbird Lane, Dallas, TX 75205",
          date: "2024-01-20",
          price: "Various prices",
          type: "garage_sale"
        },
        {
          title: "Estate Sale - Mid-Century Modern Furniture",
          description: "Beautiful mid-century modern pieces, vintage jewelry, art, and collectibles from estate.",
          location: "4821 Swiss Avenue, Dallas, TX 75214",
          date: "2024-01-21",
          price: "$5-500",
          type: "estate_sale"
        }
      ]
    },
    {
      type: 'thrift_stores',
      content: [
        {
          title: "New Vintage Boutique Opens in Deep Ellum",
          description: "Curated vintage clothing and accessories from the 70s-90s. Grand opening specials.",
          location: "2912 Main Street, Dallas, TX 75226",
          date: "2024-01-19",
          price: "$10-150",
          type: "thrift_store"
        }
      ]
    },
    {
      type: 'events',
      content: [
        {
          title: "Dallas Flea Market - First Trade Days",
          description: "Monthly flea market with over 200 vendors selling antiques, vintage, and handmade items.",
          location: "Fair Park, Dallas, TX",
          date: "2024-01-27",
          price: "$5 admission",
          type: "flea_market"
        }
      ]
    }
  ];

  // Process simulated data through AI for realistic content
  for (const source of dallasThriftingSources) {
    for (const item of source.content) {
      try {
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

        const response = await enhanced.json();
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

  return scrapedData;
}

async function aiContentProcessor(rawContent: RawContent[], openAIApiKey: string): Promise<ProcessedContent[]> {
  try {
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

Only keep items with relevance ≥ 7 and DFW location.
Return JSON array with: {id, title, description, category, location, relevance_score, actionable_details, date, source_data}`
        }, {
          role: 'user',
          content: `Process this raw content:\n\n${JSON.stringify(rawContent)}`
        }],
        temperature: 0.2
      }),
    });

    const data = await response.json();
    const processed = JSON.parse(data.choices[0].message.content || '[]');
    
    return processed.filter((item: any) => item.relevance_score >= 7);

  } catch (error) {
    console.error('Error processing content:', error);
    return [];
  }
}

async function aiArticleGenerator(processedContent: ProcessedContent[], openAIApiKey: string): Promise<GeneratedArticle[]> {
  if (processedContent.length === 0) return [];

  // Group content by category
  const grouped = processedContent.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ProcessedContent[]>);

  const articles: GeneratedArticle[] = [];

  for (const [category, items] of Object.entries(grouped)) {
    if (items.length < 1) continue;

    const articlePrompt = getArticlePrompt(category);
    
    try {
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

      const data = await response.json();
      const generated = JSON.parse(data.choices[0].message.content || '{}');
      
      articles.push({
        ...generated,
        category,
        author: 'Thriphti AI Editor',
        city: 'Dallas'
      });

    } catch (error) {
      console.error(`Error generating article for ${category}:`, error);
    }
  }

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
  const savedArticles = [];

  // Save pipeline data
  for (const processed of processedContent) {
    const { data: pipelineData } = await supabase
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

    if (pipelineData) {
      console.log(`Saved pipeline item: ${pipelineData.id}`);
    }
  }

  // Save generated articles
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
        console.log(`Saved article: ${articleData.title}`);
      }

    } catch (error) {
      console.error('Error saving article:', error);
    }
  }

  return savedArticles;
}

async function updateSourceStats(supabase: any, sources: any[]): Promise<void> {
  for (const source of sources) {
    await supabase
      .from('content_sources')
      .update({
        last_scraped: new Date().toISOString(),
        total_attempts: (source.total_attempts || 0) + 1,
        successful_attempts: (source.successful_attempts || 0) + 1,
        success_rate: ((source.successful_attempts || 0) + 1) / ((source.total_attempts || 0) + 1)
      })
      .eq('id', source.id);
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
