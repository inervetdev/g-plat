// User management API functions

import { supabase } from '../supabase'
import type { User, UserWithStats, UserFilters, PaginationParams, PaginatedResponse } from '@/types/admin'

export interface UserStats {
  total: number
  active: number
  premium: number
  business: number
  today_signups: number
}

/**
 * Fetch user statistics
 */
export async function fetchUserStats(): Promise<UserStats> {
  // Get total users count
  const { count: totalCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // Get active users count
  const { count: activeCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get premium users count
  const { count: premiumCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_tier', 'PREMIUM')

  // Get business users count
  const { count: businessCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_tier', 'BUSINESS')

  // Get today's signups (users created today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: todayCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  return {
    total: totalCount || 0,
    active: activeCount || 0,
    premium: premiumCount || 0,
    business: businessCount || 0,
    today_signups: todayCount || 0,
  }
}

/**
 * Fetch users with filters and pagination
 */
export async function fetchUsers(
  filters: UserFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 50 }
): Promise<PaginatedResponse<UserWithStats>> {
  const { page, per_page } = pagination
  const offset = (page - 1) * per_page

  // Build query - fetch users only first
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  if (filters.subscription_tier && filters.subscription_tier !== 'all') {
    query = query.eq('subscription_tier', filters.subscription_tier)
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
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
    console.error('Error fetching users:', error)
    throw error
  }

  // Fetch card counts separately for each user
  const usersWithStats: UserWithStats[] = await Promise.all(
    (data || []).map(async (user: any) => {
      // Get business card count
      const { count: cardCount } = await supabase
        .from('business_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get sidejob card count
      const { count: sidejobCount } = await supabase
        .from('sidejob_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      return {
        ...user,
        card_count: cardCount || 0,
        sidejob_count: sidejobCount || 0,
        qr_scan_count: 0, // TODO: Calculate from qr_scans
        total_views: 0, // TODO: Calculate from visitor_stats
      }
    })
  )

  return {
    data: usersWithStats,
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

/**
 * Fetch single user by ID with stats
 */
export async function fetchUser(userId: string): Promise<UserWithStats | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    throw error
  }

  if (!data) return null

  // Get card counts
  const { count: cardCount } = await supabase
    .from('business_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: sidejobCount } = await supabase
    .from('sidejob_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    ...data,
    card_count: cardCount || 0,
    sidejob_count: sidejobCount || 0,
    qr_scan_count: 0,
    total_views: 0,
  }
}

/**
 * Fetch user's business cards
 */
export async function fetchUserCards(userId: string) {
  const { data, error } = await supabase
    .from('business_cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user cards:', error)
    throw error
  }

  // Get sidejob count for each card
  const cardsWithStats = await Promise.all(
    (data || []).map(async (card: any) => {
      // Note: sidejobs are linked to users, not individual cards
      const { count: sidejobCount } = await supabase
        .from('sidejob_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', card.user_id)

      // Get view count from visitor_stats
      const { count: viewCount } = await supabase
        .from('visitor_stats')
        .select('*', { count: 'exact', head: true })
        .eq('business_card_id', card.id)

      return {
        ...card,
        sidejob_count: sidejobCount || 0,
        view_count: viewCount || 0,
      }
    })
  )

  return cardsWithStats
}

/**
 * Update user information
 */
export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user:', error)
    throw error
  }

  // Log the action
  await logAdminAction({
    action: 'user_updated',
    target_type: 'user',
    target_id: userId,
    details: { updated_fields: Object.keys(data) },
  })
}

/**
 * Update user status
 */
export async function updateUserStatus(
  userId: string,
  status: 'active' | 'inactive' | 'suspended',
  reason?: string
): Promise<void> {
  console.log('🔄 Updating user status:', { userId, status, reason })

  const { data, error } = await supabase
    .from('users')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()

  console.log('📊 Update result:', { data, error })

  if (error) {
    console.error('❌ Error updating user status:', error)
    throw error
  }

  console.log('✅ User status updated successfully:', data)

  // Log the action
  await logAdminAction({
    action: status === 'suspended' ? 'user_suspended' : `user_${status}`,
    target_type: 'user',
    target_id: userId,
    details: { status, reason },
  })
}

/**
 * Update user subscription tier
 */
export async function updateUserSubscription(
  userId: string,
  tier: 'free' | 'premium' | 'business'
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user subscription:', error)
    throw error
  }

  // Log the action
  await logAdminAction({
    action: 'user_subscription_changed',
    target_type: 'user',
    target_id: userId,
    details: { new_tier: tier },
  })
}

/**
 * Delete user (soft delete by setting deleted_at or permanent delete)
 */
export async function deleteUser(userId: string, permanent = false, reason?: string): Promise<void> {
  if (permanent) {
    // Hard delete - use with caution!
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting user:', error)
      throw error
    }

    await logAdminAction({
      action: 'user_deleted_permanent',
      target_type: 'user',
      target_id: userId,
      details: { permanent: true },
    })
  } else {
    // Soft delete - set deleted_at, deletion_reason, and status to 'inactive'
    const { error } = await supabase
      .from('users')
      .update({
        deleted_at: new Date().toISOString(),
        deletion_reason: reason || null,
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error soft deleting user:', error)
      throw error
    }

    await logAdminAction({
      action: 'user_deleted_soft',
      target_type: 'user',
      target_id: userId,
      details: { reason },
    })
  }
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
