// Admin Sidejob Card API Functions
// CRUD operations for templates and instances

import { supabase } from '../supabase'
import type {
  AdminSidejobTemplate,
  AdminSidejobTemplateInput,
  AdminSidejobTemplateWithStats,
  AdminSidejobInstance,
  AdminSidejobInstanceInput,
  AdminSidejobInstanceUpdateInput,
  AdminSidejobInstanceWithTemplate,
  AdminSidejobClick,
  TemplateFilters,
  InstanceFilters,
  PaginationParams,
  PaginatedResponse,
  TemplateStats,
  InstanceStats,
} from '@/types/sidejob'

// ============================================================================
// TEMPLATE CRUD
// ============================================================================

/**
 * Fetch templates with filters and pagination
 */
export async function fetchTemplates(
  filters: TemplateFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 20 }
): Promise<PaginatedResponse<AdminSidejobTemplate>> {
  const { page, per_page } = pagination
  const offset = (page - 1) * per_page

  let query = supabase
    .from('admin_sidejob_templates')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,partner_name.ilike.%${filters.search}%`)
  }

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  if (filters.is_active !== undefined && filters.is_active !== 'all') {
    query = query.eq('is_active', filters.is_active)
  }

  if (filters.partner_id) {
    query = query.eq('partner_id', filters.partner_id)
  }

  // Apply sorting
  const sortBy = filters.sort_by || 'display_priority'
  const sortOrder = filters.sort_order || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  query = query.range(offset, offset + per_page - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching templates:', error)
    throw error
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

/**
 * Fetch single template by ID
 */
export async function fetchTemplate(templateId: string): Promise<AdminSidejobTemplate | null> {
  const { data, error } = await supabase
    .from('admin_sidejob_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) {
    console.error('Error fetching template:', error)
    throw error
  }

  return data
}

/**
 * Fetch template with statistics
 */
export async function fetchTemplateWithStats(
  templateId: string
): Promise<AdminSidejobTemplateWithStats | null> {
  const { data, error } = await supabase
    .from('admin_sidejob_template_stats')
    .select('*')
    .eq('template_id', templateId)
    .single()

  if (error) {
    console.error('Error fetching template stats:', error)
    throw error
  }

  return data as AdminSidejobTemplateWithStats
}

/**
 * Create new template
 */
export async function createTemplate(
  input: AdminSidejobTemplateInput
): Promise<AdminSidejobTemplate> {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('admin_sidejob_templates')
    .insert({
      ...input,
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating template:', error)
    throw error
  }

  await logAdminAction({
    action: 'sidejob_template_created',
    target_type: 'sidejob',
    target_id: data.id,
    details: { title: input.title, category: input.category },
  })

  return data
}

/**
 * Update template
 */
export async function updateTemplate(
  templateId: string,
  input: Partial<AdminSidejobTemplateInput>
): Promise<AdminSidejobTemplate> {
  const { data, error } = await supabase
    .from('admin_sidejob_templates')
    .update(input)
    .eq('id', templateId)
    .select()
    .single()

  if (error) {
    console.error('Error updating template:', error)
    throw error
  }

  await logAdminAction({
    action: 'sidejob_template_updated',
    target_type: 'sidejob',
    target_id: templateId,
    details: input,
  })

  return data
}

/**
 * Delete template (soft delete by setting is_active to false)
 */
export async function deleteTemplate(templateId: string, permanent = false): Promise<void> {
  if (permanent) {
    const { error } = await supabase
      .from('admin_sidejob_templates')
      .delete()
      .eq('id', templateId)

    if (error) {
      console.error('Error deleting template:', error)
      throw error
    }

    await logAdminAction({
      action: 'sidejob_template_deleted_permanent',
      target_type: 'sidejob',
      target_id: templateId,
      details: { permanent: true },
    })
  } else {
    await updateTemplate(templateId, { is_active: false })
  }
}

// ============================================================================
// INSTANCE CRUD
// ============================================================================

/**
 * Fetch instances with filters and pagination
 */
export async function fetchInstances(
  filters: InstanceFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 20 }
): Promise<PaginatedResponse<AdminSidejobInstanceWithTemplate>> {
  const { page, per_page } = pagination
  const offset = (page - 1) * per_page

  let query = supabase
    .from('admin_sidejob_instances')
    .select(`
      *,
      template:admin_sidejob_templates(*),
      user:users(id, name, email, subscription_tier)
    `, { count: 'exact' })

  // Apply filters
  if (filters.template_id) {
    query = query.eq('template_id', filters.template_id)
  }

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id)
  }

  if (filters.assignment_target && filters.assignment_target !== 'all') {
    query = query.eq('assignment_target', filters.assignment_target)
  }

  if (filters.instance_type && filters.instance_type !== 'all') {
    query = query.eq('instance_type', filters.instance_type)
  }

  if (filters.is_active !== undefined && filters.is_active !== 'all') {
    query = query.eq('is_active', filters.is_active)
  }

  // Apply sorting
  const sortBy = filters.sort_by || 'assigned_at'
  const sortOrder = filters.sort_order || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  query = query.range(offset, offset + per_page - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching instances:', error)
    throw error
  }

  return {
    data: (data || []) as AdminSidejobInstanceWithTemplate[],
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

/**
 * Fetch single instance by ID
 */
export async function fetchInstance(
  instanceId: string
): Promise<AdminSidejobInstanceWithTemplate | null> {
  const { data, error } = await supabase
    .from('admin_sidejob_instances')
    .select(`
      *,
      template:admin_sidejob_templates(*),
      user:users(id, name, email, subscription_tier)
    `)
    .eq('id', instanceId)
    .single()

  if (error) {
    console.error('Error fetching instance:', error)
    throw error
  }

  return data as AdminSidejobInstanceWithTemplate
}

/**
 * Fetch instances by template ID
 */
export async function fetchInstancesByTemplate(
  templateId: string
): Promise<AdminSidejobInstanceWithTemplate[]> {
  const { data, error } = await supabase
    .from('admin_sidejob_instances')
    .select(`
      *,
      template:admin_sidejob_templates(*),
      user:users(id, name, email, subscription_tier)
    `)
    .eq('template_id', templateId)
    .order('assigned_at', { ascending: false })

  if (error) {
    console.error('Error fetching instances by template:', error)
    throw error
  }

  return (data || []) as AdminSidejobInstanceWithTemplate[]
}

/**
 * Create new instance (assignment)
 */
export async function createInstance(
  input: AdminSidejobInstanceInput
): Promise<AdminSidejobInstance> {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('admin_sidejob_instances')
    .insert({
      ...input,
      assigned_by: user?.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating instance:', error)
    throw error
  }

  await logAdminAction({
    action: 'sidejob_instance_created',
    target_type: 'sidejob',
    target_id: data.id,
    details: {
      template_id: input.template_id,
      assignment_target: input.assignment_target,
      user_id: input.user_id,
    },
  })

  return data
}

/**
 * Update instance
 */
export async function updateInstance(
  instanceId: string,
  input: AdminSidejobInstanceUpdateInput
): Promise<AdminSidejobInstance> {
  const { data, error } = await supabase
    .from('admin_sidejob_instances')
    .update(input)
    .eq('id', instanceId)
    .select()
    .single()

  if (error) {
    console.error('Error updating instance:', error)
    throw error
  }

  await logAdminAction({
    action: 'sidejob_instance_updated',
    target_type: 'sidejob',
    target_id: instanceId,
    details: input,
  })

  return data
}

/**
 * Delete instance
 */
export async function deleteInstance(instanceId: string): Promise<void> {
  const { error } = await supabase
    .from('admin_sidejob_instances')
    .delete()
    .eq('id', instanceId)

  if (error) {
    console.error('Error deleting instance:', error)
    throw error
  }

  await logAdminAction({
    action: 'sidejob_instance_deleted',
    target_type: 'sidejob',
    target_id: instanceId,
    details: {},
  })
}

/**
 * Bulk create instances (for group assignments)
 */
export async function bulkCreateInstances(
  inputs: AdminSidejobInstanceInput[]
): Promise<AdminSidejobInstance[]> {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('admin_sidejob_instances')
    .insert(inputs.map(input => ({
      ...input,
      assigned_by: user?.id,
    })))
    .select()

  if (error) {
    console.error('Error bulk creating instances:', error)
    throw error
  }

  await logAdminAction({
    action: 'sidejob_instances_bulk_created',
    target_type: 'sidejob',
    target_id: null,
    details: { count: inputs.length },
  })

  return data || []
}

// ============================================================================
// CLICK TRACKING
// ============================================================================

/**
 * Fetch clicks for an instance
 */
export async function fetchClicksByInstance(
  instanceId: string,
  pagination: PaginationParams = { page: 1, per_page: 50 }
): Promise<PaginatedResponse<AdminSidejobClick>> {
  const { page, per_page } = pagination
  const offset = (page - 1) * per_page

  const { data, error, count } = await supabase
    .from('admin_sidejob_clicks')
    .select('*', { count: 'exact' })
    .eq('instance_id', instanceId)
    .order('clicked_at', { ascending: false })
    .range(offset, offset + per_page - 1)

  if (error) {
    console.error('Error fetching clicks:', error)
    throw error
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

/**
 * Update click as conversion
 */
export async function markClickAsConversion(
  clickId: string,
  conversionType: string,
  conversionValue?: number
): Promise<void> {
  const { error } = await supabase
    .from('admin_sidejob_clicks')
    .update({
      is_conversion: true,
      conversion_type: conversionType,
      conversion_value: conversionValue,
      converted_at: new Date().toISOString(),
    })
    .eq('id', clickId)

  if (error) {
    console.error('Error marking conversion:', error)
    throw error
  }

  await logAdminAction({
    action: 'sidejob_click_marked_conversion',
    target_type: 'sidejob',
    target_id: clickId,
    details: { conversion_type: conversionType, conversion_value: conversionValue },
  })
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get overall template statistics
 */
export async function fetchTemplateStats(): Promise<TemplateStats> {
  // Get template counts
  const { data: templates, error: templatesError } = await supabase
    .from('admin_sidejob_templates')
    .select('category, is_active, total_clicks, total_conversions, commission_rate')

  if (templatesError) {
    console.error('Error fetching template stats:', templatesError)
    throw templatesError
  }

  const activeTemplates = templates?.filter(t => t.is_active) || []
  const totalClicks = templates?.reduce((sum, t) => sum + (t.total_clicks || 0), 0) || 0
  const totalConversions = templates?.reduce((sum, t) => sum + (t.total_conversions || 0), 0) || 0
  const totalExpectedRevenue = templates?.reduce(
    (sum, t) => sum + ((t.total_conversions || 0) * (t.commission_rate || 0)),
    0
  ) || 0

  // Group by category
  const byCategory = Object.entries(
    (templates || []).reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { count: 0, clicks: 0, conversions: 0 }
      }
      acc[t.category].count++
      acc[t.category].clicks += t.total_clicks || 0
      acc[t.category].conversions += t.total_conversions || 0
      return acc
    }, {} as Record<string, { count: number; clicks: number; conversions: number }>)
  ).map(([category, stats]) => ({
    category: category as any,
    ...stats,
  }))

  // Get total instances
  const { count: totalInstances } = await supabase
    .from('admin_sidejob_instances')
    .select('*', { count: 'exact', head: true })

  return {
    total_templates: templates?.length || 0,
    active_templates: activeTemplates.length,
    total_instances: totalInstances || 0,
    total_clicks: totalClicks,
    total_conversions: totalConversions,
    total_expected_revenue: totalExpectedRevenue,
    by_category: byCategory,
  }
}

/**
 * Get instance statistics
 */
export async function fetchInstanceStats(): Promise<InstanceStats> {
  const { data: instances, error } = await supabase
    .from('admin_sidejob_instances')
    .select('assignment_target, instance_type, click_count, conversion_count, commission_earned, commission_pending')

  if (error) {
    console.error('Error fetching instance stats:', error)
    throw error
  }

  const byAssignmentTarget = (instances || []).reduce((acc, i) => {
    acc[i.assignment_target] = (acc[i.assignment_target] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byInstanceType = (instances || []).reduce((acc, i) => {
    acc[i.instance_type] = (acc[i.instance_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total_instances: instances?.length || 0,
    by_assignment_target: byAssignmentTarget as any,
    by_instance_type: byInstanceType as any,
    total_clicks: instances?.reduce((sum, i) => sum + (i.click_count || 0), 0) || 0,
    total_conversions: instances?.reduce((sum, i) => sum + (i.conversion_count || 0), 0) || 0,
    total_commission_earned: instances?.reduce((sum, i) => sum + (i.commission_earned || 0), 0) || 0,
    total_commission_pending: instances?.reduce((sum, i) => sum + (i.commission_pending || 0), 0) || 0,
  }
}

// ============================================================================
// USER SEARCH (for assignment)
// ============================================================================

/**
 * Search users for assignment
 */
export async function searchUsersForAssignment(
  search: string,
  subscriptionTier?: 'FREE' | 'PREMIUM' | 'BUSINESS'
): Promise<Array<{
  id: string
  name: string
  email: string
  subscription_tier: string
}>> {
  let query = supabase
    .from('users')
    .select('id, name, email, subscription_tier')
    .or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    .limit(20)

  if (subscriptionTier) {
    query = query.eq('subscription_tier', subscriptionTier)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error searching users:', error)
    throw error
  }

  return data || []
}

// ============================================================================
// ADMIN LOGGING
// ============================================================================

async function logAdminAction(params: {
  action: string
  target_type: string
  target_id: string | null
  details?: Record<string, any>
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.warn('No authenticated user found for logging')
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
