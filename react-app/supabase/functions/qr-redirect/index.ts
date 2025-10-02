// QR 코드 리다이렉트 및 스캔 추적 Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // URL 파라미터에서 short_code 추출
    const url = new URL(req.url)
    const shortCode = url.pathname.split('/').pop()

    if (!shortCode) {
      return new Response(
        JSON.stringify({ error: 'Short code is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // QR 코드 정보 조회
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single()

    if (qrError || !qrCode) {
      return new Response(
        JSON.stringify({ error: 'QR code not found or inactive' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 스캔 정보 수집
    const headers = req.headers
    const userAgent = headers.get('user-agent') || 'Unknown'
    const ipAddress = headers.get('x-forwarded-for') ||
                      headers.get('x-real-ip') ||
                      'Unknown'
    const referer = headers.get('referer') || null

    // 디바이스 타입 판단
    let deviceType = 'desktop'
    const ua = userAgent.toLowerCase()
    if (ua.includes('mobile') || ua.includes('android')) {
      deviceType = 'mobile'
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet'
    }

    // 브라우저 판단
    let browser = 'Unknown'
    if (ua.includes('chrome')) browser = 'Chrome'
    else if (ua.includes('firefox')) browser = 'Firefox'
    else if (ua.includes('safari')) browser = 'Safari'
    else if (ua.includes('edge')) browser = 'Edge'
    else if (ua.includes('opera')) browser = 'Opera'

    // OS 판단
    let os = 'Unknown'
    if (ua.includes('windows')) os = 'Windows'
    else if (ua.includes('mac')) os = 'MacOS'
    else if (ua.includes('linux')) os = 'Linux'
    else if (ua.includes('android')) os = 'Android'
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'

    // 스캔 기록 저장
    const { error: scanError } = await supabase
      .from('qr_scans')
      .insert({
        qr_code_id: qrCode.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_type: deviceType,
        browser: browser,
        os: os,
        referrer: referer,
        scanned_at: new Date().toISOString()
      })

    if (scanError) {
      console.error('Error recording scan:', scanError)
      // 스캔 기록 실패해도 리다이렉트는 진행
    }

    // 스캔 카운트 증가
    await supabase
      .from('qr_codes')
      .update({ scan_count: (qrCode.scan_count || 0) + 1 })
      .eq('id', qrCode.id)

    // 동적 URL 처리
    let targetUrl = qrCode.target_url

    if (qrCode.target_type === 'dynamic') {
      // 캠페인별 처리
      if (qrCode.campaign === 'social_media') {
        // 소셜 미디어 캠페인: 디바이스에 따라 다른 URL
        if (deviceType === 'mobile') {
          targetUrl = qrCode.mobile_url || targetUrl
        }
      } else if (qrCode.campaign === 'event') {
        // 이벤트 캠페인: 시간대별 처리
        const hour = new Date().getHours()
        if (hour >= 9 && hour < 18) {
          targetUrl = qrCode.business_hours_url || targetUrl
        }
      }
      // 추가 동적 로직 구현 가능
    }

    // 리다이렉트
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': targetUrl,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error processing QR redirect:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})