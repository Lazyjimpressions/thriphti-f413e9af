
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    console.log('Setting up test content sources...');

    const testSources = [
      {
        name: 'Dallas Garage Sales',
        url: 'https://dallas.craigslist.org/search/gms',
        category: 'garage_sale',
        active: true,
        description: 'Craigslist garage sales in Dallas area'
      },
      {
        name: 'Estate Sales Network',
        url: 'https://www.estatesales.net/TX/Dallas',
        category: 'estate_sale',
        active: true,
        description: 'Estate sales in Dallas-Fort Worth'
      },
      {
        name: 'Dallas Thrift Stores',
        url: 'https://www.yelp.com/dallas/thrift-stores',
        category: 'thrift_store',
        active: true,
        description: 'Thrift stores in Dallas area'
      },
      {
        name: 'Canton Trade Days',
        url: 'https://www.firstmondaycantontradedays.com',
        category: 'flea_market',
        active: true,
        description: 'Americas largest flea market'
      }
    ];

    let insertedCount = 0;

    for (const source of testSources) {
      // Check if source already exists
      const { data: existing } = await supabase
        .from('content_sources')
        .select('id')
        .eq('url', source.url)
        .single();

      if (!existing) {
        const { data, error } = await supabase
          .from('content_sources')
          .insert(source)
          .select()
          .single();

        if (error) {
          console.error('Error inserting source:', error);
        } else {
          console.log(`Inserted source: ${data.name}`);
          insertedCount++;
        }
      } else {
        console.log(`Source already exists: ${source.name}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Setup completed. Inserted ${insertedCount} new sources.`,
      total_sources: testSources.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in setup-test-content-sources:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
