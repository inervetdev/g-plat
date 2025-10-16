import { supabase } from './supabase'

interface DownloadTrackingData {
  attachmentId: string
  businessCardId: string
  userId?: string
}

// Parse user agent to extract device info
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()

  // Device type detection
  let deviceType = 'desktop'
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    deviceType = 'tablet'
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    deviceType = 'mobile'
  }

  // Browser detection
  let browser = 'Unknown'
  if (ua.includes('edg/')) browser = 'Edge'
  else if (ua.includes('chrome/') && !ua.includes('edg/')) browser = 'Chrome'
  else if (ua.includes('safari/') && !ua.includes('chrome/')) browser = 'Safari'
  else if (ua.includes('firefox/')) browser = 'Firefox'
  else if (ua.includes('opera/') || ua.includes('opr/')) browser = 'Opera'
  else if (ua.includes('trident/')) browser = 'IE'

  // OS detection
  let os = 'Unknown'
  if (ua.includes('windows nt 10.0')) os = 'Windows 10'
  else if (ua.includes('windows nt 6.3')) os = 'Windows 8.1'
  else if (ua.includes('windows nt 6.2')) os = 'Windows 8'
  else if (ua.includes('windows nt 6.1')) os = 'Windows 7'
  else if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac os x')) os = 'macOS'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'
  else if (ua.includes('linux')) os = 'Linux'

  return { deviceType, browser, os }
}

export async function trackDownload(data: DownloadTrackingData) {
  try {
    const userAgent = navigator.userAgent
    const referrer = document.referrer || null
    const { deviceType, browser, os } = parseUserAgent(userAgent)

    const { error } = await supabase
      .from('attachment_downloads' as any)
      .insert({
        attachment_id: data.attachmentId,
        business_card_id: data.businessCardId,
        user_id: data.userId || null,
        user_agent: userAgent,
        referrer: referrer,
        device_type: deviceType,
        browser: browser,
        os: os,
        // IP address will be captured by Supabase/Postgres on server side
        downloaded_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error tracking download:', error)
    } else {
      console.log('✅ Download tracked successfully')
    }
  } catch (error) {
    console.error('Error in trackDownload:', error)
  }
}
