
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface RSSFeedResponse {
  isValid: boolean;
  error?: string;
  title?: string;
  itemCount?: number;
  description?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ isValid: false, error: 'URL is required' }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    console.log(`Testing RSS feed: ${url}`);

    // Fetch the RSS feed
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Thrifti-RSS-Tester/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    const feedText = await response.text();
    
    // Basic XML validation
    if (!feedText.includes('<rss') && !feedText.includes('<feed')) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          error: 'Not a valid RSS or Atom feed' 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // Parse basic feed information
    let title = '';
    let description = '';
    let itemCount = 0;

    // Extract title
    const titleMatch = feedText.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // Extract description
    const descriptionMatch = feedText.match(/<description[^>]*>([^<]*)<\/description>/i);
    if (descriptionMatch) {
      description = descriptionMatch[1].trim();
    }

    // Count items
    const itemMatches = feedText.match(/<item[^>]*>/gi) || feedText.match(/<entry[^>]*>/gi);
    if (itemMatches) {
      itemCount = itemMatches.length;
    }

    const result: RSSFeedResponse = {
      isValid: true,
      title: title || 'Unknown Feed',
      description: description || '',
      itemCount: itemCount
    };

    console.log(`RSS feed test successful:`, result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('RSS feed test error:', error);
    
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  }
});
