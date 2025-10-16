// Kakao Geocoding API Proxy
// This Edge Function acts as a proxy to avoid CORS issues when calling Kakao API from the browser

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

    // Get Kakao API key from environment variables
    const kakaoRestApiKey = Deno.env.get('KAKAO_REST_API_KEY')

    console.log('Environment check:', {
      hasKakaoKey: !!kakaoRestApiKey,
      keyLength: kakaoRestApiKey?.length || 0
    })

    if (!kakaoRestApiKey) {
      console.error('Missing Kakao API key')
      return new Response(
        JSON.stringify({
          error: 'Kakao API key not configured',
          details: 'KAKAO_REST_API_KEY 환경 변수를 설정해주세요.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Call Kakao Local API - Address Search
    console.log('Calling Kakao Local API:', { query })

    const kakaoResponse = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `KakaoAK ${kakaoRestApiKey}`,
          'Accept': 'application/json',
        },
      }
    )

    console.log('Kakao API response status:', kakaoResponse.status)

    if (!kakaoResponse.ok) {
      const errorText = await kakaoResponse.text()
      console.error('Kakao API error:', { status: kakaoResponse.status, body: errorText })
      throw new Error(`Kakao API error (${kakaoResponse.status}): ${errorText}`)
    }

    const data = await kakaoResponse.json()

    // Transform Kakao response to match expected format
    const addresses = data.documents.map((doc: any) => ({
      roadAddress: doc.road_address?.address_name || doc.address.address_name,
      jibunAddress: doc.address.address_name,
      englishAddress: doc.road_address?.road_name_en || '', // 영문 주소 (일부만 제공)
      x: doc.x, // longitude (경도)
      y: doc.y, // latitude (위도)
      // 추가 정보
      addressName: doc.address_name,
      buildingName: doc.road_address?.building_name || '',
      zoneNo: doc.road_address?.zone_no || '', // 우편번호
    }))

    console.log(`✅ Found ${addresses.length} address(es)`)

    return new Response(
      JSON.stringify({ addresses }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
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
  2. Serve the function: `supabase functions serve kakao-geocode --no-verify-jwt`
  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/kakao-geocode' \
    --header 'Content-Type: application/json' \
    --data '{"query":"서울시 강남구 테헤란로 123"}'

*/
