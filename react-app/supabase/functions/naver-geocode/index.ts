// Naver Geocoding API Proxy
// This Edge Function acts as a proxy to avoid CORS issues when calling Naver API from the browser

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get Naver API credentials from environment variables
    const naverClientId = Deno.env.get('NAVER_CLIENT_ID')
    const naverClientSecret = Deno.env.get('NAVER_CLIENT_SECRET')

    if (!naverClientId || !naverClientSecret) {
      return new Response(
        JSON.stringify({ error: 'Naver API credentials not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Call Naver Geocoding API
    const naverResponse = await fetch(
      `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': naverClientId,
          'X-NCP-APIGW-API-KEY': naverClientSecret,
        },
      }
    )

    if (!naverResponse.ok) {
      throw new Error(`Naver API error: ${naverResponse.statusText}`)
    }

    const data = await naverResponse.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Geocode error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Serve the function: `supabase functions serve naver-geocode --no-verify-jwt`
  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/naver-geocode' \
    --header 'Content-Type: application/json' \
    --data '{"query":"서울시 강남구 테헤란로 123"}'

*/
