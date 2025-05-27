
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category?: string;
}

interface ValidationResult {
  isValid: boolean;
  title?: string;
  description?: string;
  items?: RSSItem[];
  error?: string;
  itemCount?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Validating RSS feed:', url);

    // Check cache first (cache for 1 hour)
    const { data: cached } = await supabase
      .from('rss_feed_validation_cache')
      .select('*')
      .eq('url', url)
      .gte('last_validated', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .single();

    if (cached) {
      console.log('Using cached result for:', url);
      return new Response(
        JSON.stringify({
          isValid: cached.is_valid,
          title: cached.title,
          description: cached.description,
          items: cached.feed_items || [],
          itemCount: cached.item_count,
          error: cached.error_message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      const result = {
        isValid: false,
        error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.'
      };
      await cacheResult(supabase, url, result);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch the RSS feed
    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Thriphti RSS Validator/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        }
      });
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Fetch error:', error);
      const result = {
        isValid: false,
        error: error.name === 'AbortError' 
          ? 'Request timed out. The RSS feed took too long to respond.'
          : `Network error: Unable to reach the RSS feed. ${error.message}`
      };
      await cacheResult(supabase, url, result);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!response.ok) {
      const result = {
        isValid: false,
        error: `HTTP ${response.status}: ${response.statusText}. The RSS feed URL returned an error.`
      };
      await cacheResult(supabase, url, result);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the XML content
    let xmlText: string;
    try {
      xmlText = await response.text();
    } catch (error) {
      const result = {
        isValid: false,
        error: 'Unable to read the response content.'
      };
      await cacheResult(supabase, url, result);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Basic XML validation and RSS parsing
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      
      // Check for XML parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format');
      }

      // Check if it's an RSS feed
      const rssElement = doc.querySelector('rss') || doc.querySelector('feed');
      if (!rssElement) {
        throw new Error('Not a valid RSS or Atom feed');
      }

      // Extract feed metadata
      const isAtom = doc.querySelector('feed') !== null;
      const feedTitle = isAtom 
        ? doc.querySelector('feed > title')?.textContent?.trim() || 'Untitled Feed'
        : doc.querySelector('channel > title')?.textContent?.trim() || 'Untitled Feed';
      
      const feedDescription = isAtom
        ? doc.querySelector('feed > subtitle')?.textContent?.trim() || ''
        : doc.querySelector('channel > description')?.textContent?.trim() || '';

      // Extract items
      const itemElements = isAtom 
        ? Array.from(doc.querySelectorAll('entry'))
        : Array.from(doc.querySelectorAll('item'));

      const items: RSSItem[] = itemElements.slice(0, 10).map(item => {
        if (isAtom) {
          return {
            title: item.querySelector('title')?.textContent?.trim() || 'Untitled',
            description: item.querySelector('summary')?.textContent?.trim() || 
                        item.querySelector('content')?.textContent?.trim() || '',
            link: item.querySelector('link')?.getAttribute('href') || '',
            pubDate: item.querySelector('published')?.textContent?.trim() || 
                    item.querySelector('updated')?.textContent?.trim() || '',
            category: item.querySelector('category')?.getAttribute('term') || undefined
          };
        } else {
          return {
            title: item.querySelector('title')?.textContent?.trim() || 'Untitled',
            description: item.querySelector('description')?.textContent?.trim() || '',
            link: item.querySelector('link')?.textContent?.trim() || '',
            pubDate: item.querySelector('pubDate')?.textContent?.trim() || '',
            category: item.querySelector('category')?.textContent?.trim() || undefined
          };
        }
      });

      const result: ValidationResult = {
        isValid: true,
        title: feedTitle,
        description: feedDescription,
        items: items,
        itemCount: items.length
      };

      await cacheResult(supabase, url, result);

      console.log(`Successfully validated RSS feed: ${feedTitle} (${items.length} items)`);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('XML parsing error:', error);
      const result = {
        isValid: false,
        error: `Invalid RSS feed format: ${error.message}. Please ensure the URL points to a valid RSS or Atom feed.`
      };
      await cacheResult(supabase, url, result);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        error: 'An unexpected error occurred while validating the RSS feed.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function cacheResult(supabase: any, url: string, result: ValidationResult) {
  try {
    await supabase
      .from('rss_feed_validation_cache')
      .upsert({
        url,
        is_valid: result.isValid,
        title: result.title,
        description: result.description,
        item_count: result.itemCount || 0,
        error_message: result.error,
        feed_items: result.items || [],
        last_validated: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to cache result:', error);
  }
}
