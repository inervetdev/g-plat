// Business card management API functions

import { supabase } from '../supabase'
import type { CardDetailStats } from '@/types/admin'

export interface CardFilters {
  search?: string
  theme?: 'all' | 'trendy' | 'apple' | 'professional' | 'simple' | 'default'
  status?: 'all' | 'active' | 'inactive'
  date_from?: string
  date_to?: string
  sort_by?: 'created_at' | 'view_count' | 'name'
  sort_order?: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  per_page: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface CardWithUser {
  id: string
  user_id: string
  name: string
  title?: string | null
  company: string | null
  department?: string | null
  position: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  address_detail?: string | null
  latitude?: number | null
  longitude?: number | null
  linkedin?: string | null
  instagram?: string | null
  facebook?: string | null
  twitter?: string | null
  youtube?: string | null
  github?: string | null
  bio?: string | null
  profile_image_url?: string | null
  company_logo_url?: string | null
  theme: string | null
  custom_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  view_count?: number
  qr_scan_count?: number
  sidejob_count?: number
  users?: {
    id: string
    name: string
    email: string
  }
}

/**
 * Fetch business cards with filters and pagination
 */
export async function fetchCards(
  filters: CardFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 50 }
): Promise<PaginatedResponse<CardWithUser>> {
  const { page, per_page } = pagination
  const offset = (page - 1) * per_page

  // Build query
  let query = supabase
    .from('business_cards')
    .select(`
      *,
      users (
        id,
        name,
        email
      )
    `, { count: 'exact' })

  // Apply filters
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`)
  }

  if (filters.theme && filters.theme !== 'all') {
    query = query.eq('theme', filters.theme)
  }

  if (filters.status && filters.status !== 'all') {
    const isActive = filters.status === 'active'
    query = query.eq('is_active', isActive)
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to)
  }

  // Apply sorting
  const sortBy = filters.sort_by || 'created_at'
  const sortOrder = filters.sort_order || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  query = query.range(offset, offset + per_page - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching cards:', error)
    throw error
  }

  // Fetch additional stats for each card
  const cardsWithStats: CardWithUser[] = await Promise.all(
    (data || []).map(async (card: any) => {
      // Get view count from visitor_stats
      const { count: viewCount } = await supabase
        .from('visitor_stats')
        .select('*', { count: 'exact', head: true })
        .eq('business_card_id', card.id)

      // Get QR scan count
      const { data: qrCodes } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('business_card_id', card.id)

      let qrScanCount = 0
      if (qrCodes && qrCodes.length > 0) {
        const qrIds = qrCodes.map(qr => qr.id)
        const { count: scanCount } = await supabase
          .from('qr_scans')
          .select('*', { count: 'exact', head: true })
          .in('qr_code_id', qrIds)
        qrScanCount = scanCount || 0
      }

      // Get sidejob count (sidejobs are linked to users, not cards)
      const { count: sidejobCount } = await supabase
        .from('sidejob_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', card.user_id)

      return {
        ...card,
        view_count: viewCount || 0,
        qr_scan_count: qrScanCount,
        sidejob_count: sidejobCount || 0,
      }
    })
  )

  return {
    data: cardsWithStats,
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

/**
 * Fetch single card by ID
 */
export async function fetchCard(cardId: string): Promise<CardWithUser | null> {
  const { data, error } = await supabase
    .from('business_cards')
    .select(`
      *,
      users (
        id,
        name,
        email
      )
    `)
    .eq('id', cardId)
    .single()

  if (error) {
    console.error('Error fetching card:', error)
    throw error
  }

  return data
}

/**
 * Update card status
 */
export async function updateCardStatus(
  cardId: string,
  isActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from('business_cards')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', cardId)

  if (error) {
    console.error('Error updating card status:', error)
    throw error
  }

  // Log admin action
  await logAdminAction({
    action: isActive ? 'card_activated' : 'card_deactivated',
    target_type: 'card',
    target_id: cardId,
    details: { is_active: isActive },
  })
}

/**
 * Update card theme
 */
export async function updateCardTheme(
  cardId: string,
  theme: string
): Promise<void> {
  const { error } = await supabase
    .from('business_cards')
    .update({ theme, updated_at: new Date().toISOString() })
    .eq('id', cardId)

  if (error) {
    console.error('Error updating card theme:', error)
    throw error
  }

  await logAdminAction({
    action: 'card_theme_changed',
    target_type: 'card',
    target_id: cardId,
    details: { new_theme: theme },
  })
}

/**
 * Delete card (soft delete by setting is_active to false)
 */
export async function deleteCard(cardId: string, permanent = false): Promise<void> {
  if (permanent) {
    // Hard delete - use with caution!
    const { error } = await supabase
      .from('business_cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      console.error('Error deleting card:', error)
      throw error
    }

    await logAdminAction({
      action: 'card_deleted_permanent',
      target_type: 'card',
      target_id: cardId,
      details: { permanent: true },
    })
  } else {
    // Soft delete
    await updateCardStatus(cardId, false)
  }
}

/**
 * Bulk update cards
 */
export async function bulkUpdateCards(
  cardIds: string[],
  updates: { is_active?: boolean; theme?: string }
): Promise<void> {
  const { error } = await supabase
    .from('business_cards')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .in('id', cardIds)

  if (error) {
    console.error('Error bulk updating cards:', error)
    throw error
  }

  await logAdminAction({
    action: 'cards_bulk_updated',
    target_type: 'card',
    target_id: null,
    details: { card_count: cardIds.length, updates },
  })
}

/**
 * Log admin action
 */
async function logAdminAction(params: {
  action: string
  target_type: string
  target_id: string | null
  details?: Record<string, any>
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('No authenticated user found for logging')
    return
  }

  const { error } = await supabase
    .from('admin_logs')
    .insert({
      admin_id: user.id,
      action: params.action,
      target_type: params.target_type,
      target_id: params.target_id,
      details: params.details || {},
    })

  if (error) {
    console.error('Error logging admin action:', error)
    // Don't throw - logging failure shouldn't break the operation
  }
}

/**
 * Fetch detailed statistics for a single card
 */
export async function fetchCardDetailStats(cardId: string): Promise<CardDetailStats> {
  // Get total views
  const { count: totalViews } = await supabase
    .from('visitor_stats')
    .select('*', { count: 'exact', head: true })
    .eq('business_card_id', cardId)

  // Get QR codes and scan counts
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('business_card_id', cardId)

  let totalQrScans = 0
  if (qrCodes && qrCodes.length > 0) {
    const qrIds = qrCodes.map(qr => qr.id)
    const { count: scanCount } = await supabase
      .from('qr_scans')
      .select('*', { count: 'exact', head: true })
      .in('qr_code_id', qrIds)
    totalQrScans = scanCount || 0
  }

  // Get sidejob count
  const { data: card } = await supabase
    .from('business_cards')
    .select('user_id')
    .eq('id', cardId)
    .single()

  const { count: sidejobCount } = await supabase
    .from('sidejob_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', card?.user_id || '')

  // Get views by day (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: viewsByDay } = await supabase
    .from('visitor_stats')
    .select('created_at')
    .eq('business_card_id', cardId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  // Group by date
  const viewsByDayGrouped = (viewsByDay || []).reduce((acc: Record<string, number>, visit) => {
    const date = new Date(visit.created_at).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const viewsByDayArray = Object.entries(viewsByDayGrouped).map(([date, views]) => ({
    date,
    views: views as number
  }))

  // Get recent visitors (last 50)
  const { data: recentVisitors } = await supabase
    .from('visitor_stats')
    .select('id, created_at, user_agent, referrer, visitor_ip')
    .eq('business_card_id', cardId)
    .order('created_at', { ascending: false })
    .limit(50)

  // Parse device and browser from user_agent
  const visitorsWithDeviceInfo = (recentVisitors || []).map(visitor => {
    const ua = visitor.user_agent || ''
    const device = ua.includes('Mobile') ? 'Mobile' : 'Desktop'
    let browser = 'Other'
    if (ua.includes('Chrome')) browser = 'Chrome'
    else if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Safari')) browser = 'Safari'
    else if (ua.includes('Edge')) browser = 'Edge'

    return {
      id: visitor.id,
      visited_at: visitor.created_at,
      device,
      browser,
      referrer: visitor.referrer,
      visitor_ip: visitor.visitor_ip
    }
  })

  // Count by device
  const deviceCounts = visitorsWithDeviceInfo.reduce((acc: Record<string, number>, v) => {
    acc[v.device] = (acc[v.device] || 0) + 1
    return acc
  }, {})

  const viewsByDevice = Object.entries(deviceCounts).map(([device, count]) => ({
    device,
    count: count as number
  }))

  // Count by browser
  const browserCounts = visitorsWithDeviceInfo.reduce((acc: Record<string, number>, v) => {
    acc[v.browser] = (acc[v.browser] || 0) + 1
    return acc
  }, {})

  const viewsByBrowser = Object.entries(browserCounts).map(([browser, count]) => ({
    browser,
    count: count as number
  }))

  return {
    total_views: totalViews || 0,
    total_qr_scans: totalQrScans,
    total_sidejobs: sidejobCount || 0,
    views_by_day: viewsByDayArray,
    views_by_device: viewsByDevice,
    views_by_browser: viewsByBrowser,
    recent_visitors: visitorsWithDeviceInfo
  }
}

/**
 * Update business card
 * @param cardId - Card ID to update
 * @param updates - Card data to update
 */
export async function updateCard(cardId: string, updates: Partial<CardWithUser>) {
  console.log('🔧 updateCard called:', { cardId, updates })

  const { data, error } = await supabase
    .from('business_cards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single()

  if (error) {
    console.error('❌ Error updating card:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    throw new Error(`Failed to update card: ${error.message}`)
  }

  console.log('✅ Card updated successfully:', data)
  return data
}

/**
 * Create business card input type
 */
export interface CreateCardInput {
  user_id: string
  name: string
  title?: string
  company?: string
  department?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  address_detail?: string
  latitude?: number
  longitude?: number
  linkedin?: string
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
  github?: string
  introduction?: string
  services?: string[]
  skills?: string[]
  theme?: string
  custom_url?: string
  profile_image_url?: string
  company_logo_url?: string
  is_active?: boolean
  is_primary?: boolean
}

/**
 * Create a new business card (Admin only)
 * @param input - Card data to create
 */
export async function createCard(input: CreateCardInput): Promise<CardWithUser> {
  console.log('🔧 createCard called:', input)

  const { data, error } = await supabase
    .from('business_cards')
    .insert({
      ...input,
      is_active: input.is_active ?? true,
      is_primary: input.is_primary ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select(`
      *,
      users (
        id,
        name,
        email
      )
    `)
    .single()

  if (error) {
    console.error('❌ Error creating card:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    throw new Error(`Failed to create card: ${error.message}`)
  }

  console.log('✅ Card created successfully:', data)

  // Log admin action
  await logAdminAction({
    action: 'card_created',
    target_type: 'card',
    target_id: data.id,
    details: { user_id: input.user_id, name: input.name },
  })

  return data as CardWithUser
}

/**
 * Fetch users for admin card creation
 * Returns users with their basic info for selection
 */
export async function fetchUsersForCardCreate(
  search: string = ''
): Promise<Array<{ id: string; email: string; name?: string }>> {
  // Search from business_cards to find existing users with names
  let query = supabase
    .from('business_cards')
    .select('user_id, name')
    .limit(20)

  if (search && search.length >= 2) {
    query = query.or(`name.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  // Get unique users
  const uniqueUsers = new Map<string, { id: string; email: string; name?: string }>()

  for (const card of data || []) {
    if (!uniqueUsers.has(card.user_id)) {
      uniqueUsers.set(card.user_id, {
        id: card.user_id,
        email: '',
        name: card.name,
      })
    }
  }

  return Array.from(uniqueUsers.values())
}

/**
 * Check if custom URL is available
 */
export async function checkCustomUrlAvailability(
  customUrl: string,
  excludeCardId?: string
): Promise<boolean> {
  let query = supabase
    .from('business_cards')
    .select('id')
    .eq('custom_url', customUrl)

  if (excludeCardId) {
    query = query.neq('id', excludeCardId)
  }

  const { data, error } = await query.single()

  if (error && error.code === 'PGRST116') {
    // No rows found - URL is available
    return true
  }

  if (data) {
    // URL already exists
    return false
  }

  return true
}
