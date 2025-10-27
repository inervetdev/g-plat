// User management API functions

import { supabase } from '../supabase'
import type { User, UserWithStats, UserFilters, PaginationParams, PaginatedResponse } from '@/types/admin'

/**
 * Fetch users with filters and pagination
 */
export async function fetchUsers(
  filters: UserFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 50 }
): Promise<PaginatedResponse<UserWithStats>> {
  const { page, per_page } = pagination
  const offset = (page - 1) * per_page

  // Build query
  let query = supabase
    .from('users')
    .select(`
      *,
      business_cards:business_cards(count),
      sidejob_cards:sidejob_cards(count)
    `, { count: 'exact' })

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

  // Transform data to include stats
  const usersWithStats: UserWithStats[] = (data || []).map((user: any) => ({
    ...user,
    card_count: user.business_cards?.[0]?.count || 0,
    sidejob_count: user.sidejob_cards?.[0]?.count || 0,
    qr_scan_count: 0, // TODO: Calculate from qr_scans
    total_views: 0, // TODO: Calculate from visitor_stats
  }))

  return {
    data: usersWithStats,
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

/**
 * Fetch single user by ID
 */
export async function fetchUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    throw error
  }

  return data
}

/**
 * Update user status
 */
export async function updateUserStatus(
  userId: string,
  status: 'active' | 'inactive' | 'suspended',
  reason?: string
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user status:', error)
    throw error
  }

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
 * Delete user (soft delete by setting status to inactive)
 */
export async function deleteUser(userId: string, permanent = false): Promise<void> {
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
    // Soft delete
    await updateUserStatus(userId, 'inactive')
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
