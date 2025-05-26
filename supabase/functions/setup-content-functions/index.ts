
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
    // Create helper functions for content pipeline
    const functions = [
      `
      CREATE OR REPLACE FUNCTION get_content_pipeline_data()
      RETURNS TABLE (
        id uuid,
        stage text,
        content_type text,
        raw_data jsonb,
        processed_data jsonb,
        ai_metadata jsonb,
        relevance_score double precision,
        status text,
        created_at timestamp with time zone
      )
      LANGUAGE sql STABLE
      AS $$
        SELECT 
          id,
          stage,
          content_type,
          raw_data,
          processed_data,
          ai_metadata,
          relevance_score,
          status,
          created_at
        FROM content_pipeline
        ORDER BY created_at DESC
        LIMIT 50;
      $$;
      `,
      `
      CREATE OR REPLACE FUNCTION get_content_sources_data()
      RETURNS TABLE (
        id uuid,
        url text,
        name text,
        category text,
        active boolean,
        last_scraped timestamp with time zone,
        success_rate double precision,
        total_attempts integer
      )
      LANGUAGE sql STABLE
      AS $$
        SELECT 
          id,
          url,
          name,
          category,
          active,
          last_scraped,
          success_rate,
          total_attempts
        FROM content_sources
        ORDER BY name;
      $$;
      `
    ];

    for (const func of functions) {
      const { error } = await supabase.rpc('exec_sql', { sql: func });
      if (error) {
        console.error('Error creating function:', error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Content pipeline helper functions created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error setting up functions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
