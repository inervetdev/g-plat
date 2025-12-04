import { supabase } from '@/lib/supabase'
import type {
  QRCode,
  QRCodeWithDetails,
  QRCodeStats,
  QRFilters,
  QRScan,
  PaginatedResponse,
  PaginationParams,
} from '@/types/admin'

/**
 * QR 코드 목록 조회 (페이지네이션, 필터링)
 */
export async function fetchQRCodes(
  filters: QRFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 50 }
): Promise<PaginatedResponse<QRCodeWithDetails>> {
  const { page, per_page } = pagination
  const offset = (page - 1) * per_page

  let query = supabase
    .from('qr_codes')
    .select(
      `
      *,
      business_cards (
        id,
        name,
        company,
        custom_url,
        user_id
      )
    `,
      { count: 'exact' }
    )

  // Apply filters
  if (filters.search) {
    query = query.or(
      `short_code.ilike.%${filters.search}%,campaign.ilike.%${filters.search}%,target_url.ilike.%${filters.search}%`
    )
  }

  if (filters.status && filters.status !== 'all') {
    const now = new Date().toISOString()
    if (filters.status === 'active') {
      query = query.eq('is_active', true).or(`expires_at.is.null,expires_at.gt.${now}`)
    } else if (filters.status === 'inactive') {
      query = query.eq('is_active', false)
    } else if (filters.status === 'expired') {
      query = query.lt('expires_at', now)
    }
  }

  if (filters.campaign) {
    query = query.eq('campaign', filters.campaign)
  }

  // Apply sorting
  const sortBy = filters.sort_by || 'created_at'
  const sortOrder = filters.sort_order || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  query = query.range(offset, offset + per_page - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching QR codes:', error)
    throw error
  }

  // Transform data to match QRCodeWithDetails interface
  const transformedData: QRCodeWithDetails[] = (data || []).map((qr: any) => ({
    id: qr.id,
    short_code: qr.short_code,
    target_url: qr.target_url,
    target_type: qr.target_type,
    user_id: qr.user_id,
    business_card_id: qr.business_card_id,
    campaign: qr.campaign,
    is_active: qr.is_active ?? true,
    scan_count: qr.scan_count ?? 0,
    max_scans: qr.max_scans,
    expires_at: qr.expires_at,
    target_rules: qr.target_rules,
    created_at: qr.created_at,
    updated_at: qr.updated_at,
    business_card: qr.business_cards,
    user: undefined, // User info not available via FK join
  }))

  return {
    data: transformedData,
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

/**
 * 단일 QR 코드 상세 조회
 */
export async function fetchQRCode(id: string): Promise<QRCodeWithDetails | null> {
  const { data, error } = await supabase
    .from('qr_codes')
    .select(
      `
      *,
      business_cards (
        id,
        name,
        company,
        custom_url
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching QR code:', error)
    throw error
  }

  if (!data) return null

  return {
    id: data.id,
    short_code: data.short_code,
    target_url: data.target_url,
    target_type: data.target_type,
    user_id: data.user_id,
    business_card_id: data.business_card_id,
    campaign: data.campaign,
    is_active: data.is_active ?? true,
    scan_count: data.scan_count ?? 0,
    max_scans: data.max_scans,
    expires_at: data.expires_at,
    target_rules: data.target_rules,
    created_at: data.created_at,
    updated_at: data.updated_at,
    business_card: data.business_cards as any,
    user: undefined, // User info not available via FK join
  }
}

/**
 * QR 코드 통계 조회
 */
export async function fetchQRCodeStats(qrCodeId: string): Promise<QRCodeStats> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Get all scans for this QR code
  const { data: scans, error } = await supabase
    .from('qr_scans')
    .select('*')
    .eq('qr_code_id', qrCodeId)
    .order('scanned_at', { ascending: false })

  if (error) {
    console.error('Error fetching QR scans:', error)
    throw error
  }

  const allScans = scans || []

  // Calculate stats
  const scansToday = allScans.filter((s) => s.scanned_at >= today).length
  const scansThisWeek = allScans.filter((s) => s.scanned_at >= weekAgo).length
  const scansThisMonth = allScans.filter((s) => s.scanned_at >= monthAgo).length

  // Group by day (last 30 days)
  const scansByDay: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    scansByDay[dateStr] = 0
  }
  allScans.forEach((scan) => {
    const dateStr = scan.scanned_at?.split('T')[0]
    if (dateStr && scansByDay[dateStr] !== undefined) {
      scansByDay[dateStr]++
    }
  })

  // Group by device
  const deviceCounts: Record<string, number> = {}
  allScans.forEach((scan) => {
    const device = scan.device_type || 'Unknown'
    deviceCounts[device] = (deviceCounts[device] || 0) + 1
  })

  // Group by browser
  const browserCounts: Record<string, number> = {}
  allScans.forEach((scan) => {
    const browser = scan.browser || 'Unknown'
    browserCounts[browser] = (browserCounts[browser] || 0) + 1
  })

  // Group by country
  const countryCounts: Record<string, number> = {}
  allScans.forEach((scan) => {
    const country = scan.country || 'Unknown'
    countryCounts[country] = (countryCounts[country] || 0) + 1
  })

  return {
    total_scans: allScans.length,
    scans_today: scansToday,
    scans_this_week: scansThisWeek,
    scans_this_month: scansThisMonth,
    scans_by_day: Object.entries(scansByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    scans_by_device: Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count),
    scans_by_browser: Object.entries(browserCounts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count),
    scans_by_country: Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count),
    recent_scans: allScans.slice(0, 20) as QRScan[],
  }
}

/**
 * 전체 QR 코드 통계 (대시보드용)
 */
export async function fetchQROverviewStats(): Promise<{
  totalQRCodes: number
  activeQRCodes: number
  totalScans: number
  scansToday: number
  scansThisWeek: number
  topCampaigns: Array<{ campaign: string; count: number }>
}> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Get QR codes count
  const { count: totalQRCodes } = await supabase
    .from('qr_codes')
    .select('*', { count: 'exact', head: true })

  const { count: activeQRCodes } = await supabase
    .from('qr_codes')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get total scans
  const { count: totalScans } = await supabase
    .from('qr_scans')
    .select('*', { count: 'exact', head: true })

  const { count: scansToday } = await supabase
    .from('qr_scans')
    .select('*', { count: 'exact', head: true })
    .gte('scanned_at', today)

  const { count: scansThisWeek } = await supabase
    .from('qr_scans')
    .select('*', { count: 'exact', head: true })
    .gte('scanned_at', weekAgo)

  // Get top campaigns
  const { data: campaignData } = await supabase
    .from('qr_codes')
    .select('campaign, scan_count')
    .not('campaign', 'is', null)
    .order('scan_count', { ascending: false })
    .limit(5)

  const topCampaigns = (campaignData || [])
    .filter((c) => c.campaign)
    .map((c) => ({
      campaign: c.campaign!,
      count: c.scan_count || 0,
    }))

  return {
    totalQRCodes: totalQRCodes || 0,
    activeQRCodes: activeQRCodes || 0,
    totalScans: totalScans || 0,
    scansToday: scansToday || 0,
    scansThisWeek: scansThisWeek || 0,
    topCampaigns,
  }
}

/**
 * QR 코드 활성/비활성 토글
 */
export async function toggleQRCodeActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('qr_codes')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error toggling QR code:', error)
    throw error
  }
}

/**
 * QR 코드 삭제
 */
export async function deleteQRCode(id: string): Promise<void> {
  // First delete related scans
  const { error: scansError } = await supabase.from('qr_scans').delete().eq('qr_code_id', id)

  if (scansError) {
    console.error('Error deleting QR scans:', scansError)
    throw scansError
  }

  // Then delete the QR code
  const { error } = await supabase.from('qr_codes').delete().eq('id', id)

  if (error) {
    console.error('Error deleting QR code:', error)
    throw error
  }
}

/**
 * QR 코드 업데이트
 */
export async function updateQRCode(
  id: string,
  updates: Partial<Pick<QRCode, 'campaign' | 'is_active' | 'max_scans' | 'expires_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('qr_codes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating QR code:', error)
    throw error
  }
}

/**
 * 캠페인 목록 조회
 */
export async function fetchCampaigns(): Promise<string[]> {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('campaign')
    .not('campaign', 'is', null)
    .order('campaign')

  if (error) {
    console.error('Error fetching campaigns:', error)
    throw error
  }

  // Get unique campaigns
  const campaigns = [...new Set((data || []).map((d) => d.campaign).filter(Boolean))] as string[]
  return campaigns
}
