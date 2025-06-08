
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY')

    const response = {
      openai: {
        configured: !!openaiKey,
        tested: false,
        lastTested: null
      },
      firecrawl: {
        configured: !!firecrawlKey,
        tested: false,
        lastTested: null
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error checking API status:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to check API status' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
