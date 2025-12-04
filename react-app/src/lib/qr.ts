import { supabase } from './supabase'

/**
 * Generate a unique 6-character short code for QR codes
 */
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * Create a QR code for a business card
 * @param businessCardId - The ID of the business card
 * @param targetUrl - The URL to redirect to (usually the card URL)
 * @returns The created QR code short code or null if failed
 */
export async function createQRCodeForCard(
  businessCardId: string,
  targetUrl: string
): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('User not authenticated')
      return null
    }

    // Check if QR code already exists for this business card
    const { data: existingQRs, error: fetchError } = await supabase
      .from('qr_codes')
      .select('short_code')
      .eq('business_card_id', businessCardId)
      .eq('is_active', true)
      .limit(1)

    if (existingQRs && existingQRs.length > 0 && !fetchError) {
      console.log('QR code already exists:', existingQRs[0].short_code)
      return existingQRs[0].short_code
    }

    // Generate new QR code
    const shortCode = generateShortCode()

    const { error } = await supabase
      .from('qr_codes')
      .insert({
        business_card_id: businessCardId,
        user_id: user.id,
        short_code: shortCode,
        target_url: targetUrl,
        target_type: 'static',
        is_active: true,
        scan_count: 0
      })

    if (error) {
      console.error('Error creating QR code:', error)
      // If duplicate short code, try again
      if (error.code === '23505' && error.message?.includes('short_code')) {
        console.log('Duplicate short code, retrying...')
        return createQRCodeForCard(businessCardId, targetUrl)
      }
      return null
    }

    console.log('Created new QR code:', shortCode)
    return shortCode
  } catch (error) {
    console.error('Unexpected error creating QR code:', error)
    return null
  }
}

/**
 * Get or create QR code URL for a business card
 * @param businessCardId - The ID of the business card
 * @param cardUrl - The card's public URL
 * @returns The QR redirect URL or the direct card URL if QR creation failed
 */
export async function getOrCreateQRCodeUrl(
  businessCardId: string,
  cardUrl: string
): Promise<string> {
  const shortCode = await createQRCodeForCard(businessCardId, cardUrl)

  if (!shortCode) {
    // Fallback to direct URL if QR creation failed
    return cardUrl
  }

  // Return Edge Function URL in production, direct URL in development
  const isDevelopment = window.location.hostname === 'localhost'
  if (isDevelopment) {
    return cardUrl
  }

  return `${window.location.origin}/q/${shortCode}`
}
