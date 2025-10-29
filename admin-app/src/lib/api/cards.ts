// Business card management API functions

import { supabase } from '../supabase'

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
  company: string | null
  position: string | null
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
