import { supabase } from '@/lib/supabase'
import type {
  ProductApplicationWithRelations,
  ApplicationStats,
  ApplicationFilters,
  ApplicationStatusUpdateInput,
  ApplicationAssignInput,
  ApplicationCompleteInput,
  ApplicationLog,
  PaginatedResponse,
  PaginationParams,
} from '@/types/application'

/**
 * 신청 목록 조회 (페이지네이션, 필터링)
 */
export async function fetchApplications(
  filters: ApplicationFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 50 }
): Promise<PaginatedResponse<ProductApplicationWithRelations>> {
  const { page, per_page } = pagination
  const offset = (page - 1) * per_page

  let query = supabase
    .from('product_applications')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters.search) {
    query = query.or(
      `applicant_name.ilike.%${filters.search}%,applicant_email.ilike.%${filters.search}%,applicant_phone.ilike.%${filters.search}%`
    )
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.template_id) {
    query = query.eq('template_id', filters.template_id)
  }

  if (filters.assigned_to === 'unassigned') {
    query = query.is('assigned_to', null)
  } else if (filters.assigned_to && filters.assigned_to !== 'all') {
    query = query.eq('assigned_to', filters.assigned_to)
  }

  if (filters.referrer_user_id) {
    query = query.eq('referrer_user_id', filters.referrer_user_id)
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
    console.error('Error fetching applications:', error)
    throw error
  }

  // Fetch related data
  const applicationsWithRelations: ProductApplicationWithRelations[] = await Promise.all(
    (data || []).map(async (application: any) => {
      let template = null
      let referrer = null
      let assignee = null

      // Fetch template
      if (application.template_id) {
        const { data: templateData } = await supabase
          .from('admin_sidejob_templates')
          .select('id, title, image_url, category, partner_name')
          .eq('id', application.template_id)
          .single()
        template = templateData
      }

      // Fetch referrer info from business_cards
      if (application.referrer_card_id) {
        const { data: cardData } = await supabase
          .from('business_cards')
          .select('id, name, custom_url, user_id')
          .eq('id', application.referrer_card_id)
          .single()

        if (cardData) {
          // Fetch user email from users table
          const { data: userData } = await supabase
            .from('users')
            .select('email, name')
            .eq('id', cardData.user_id)
            .single()

          referrer = {
            id: cardData.user_id,
            email: userData?.email || '',
            name: cardData.name || userData?.name || null,
            card_url: cardData.custom_url,
          }
        }
      }

      // Fetch assignee
      if (application.assigned_to) {
        const { data: assigneeData } = await supabase
          .from('admin_users')
          .select('id, name, email')
          .eq('id', application.assigned_to)
          .single()
        assignee = assigneeData
      }

      return {
        ...application,
        template,
        referrer,
        applicant: null, // 비회원 신청도 있으므로 null 가능
        assignee,
      }
    })
  )

  return {
    data: applicationsWithRelations,
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

/**
 * 단일 신청 상세 조회
 */
export async function fetchApplication(id: string): Promise<ProductApplicationWithRelations | null> {
  const { data, error } = await supabase
    .from('product_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching application:', error)
    throw error
  }

  if (!data) return null

  let template = null
  let referrer = null
  let assignee = null

  // Fetch template
  if (data.template_id) {
    const { data: templateData } = await supabase
      .from('admin_sidejob_templates')
      .select('id, title, image_url, category, partner_name')
      .eq('id', data.template_id)
      .single()
    template = templateData
  }

  // Fetch referrer
  if (data.referrer_card_id) {
    const { data: cardData } = await supabase
      .from('business_cards')
      .select('id, name, custom_url, user_id')
      .eq('id', data.referrer_card_id)
      .single()

    if (cardData) {
      const { data: userData } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', cardData.user_id)
        .single()

      referrer = {
        id: cardData.user_id,
        email: userData?.email || '',
        name: cardData.name || userData?.name || null,
        card_url: cardData.custom_url,
      }
    }
  }

  // Fetch assignee
  if (data.assigned_to) {
    const { data: assigneeData } = await supabase
      .from('admin_users')
      .select('id, name, email')
      .eq('id', data.assigned_to)
      .single()
    assignee = assigneeData
  }

  return {
    ...data,
    template,
    referrer,
    applicant: null,
    assignee,
  }
}

/**
 * 신청 통계 조회
 */
export async function fetchApplicationStats(): Promise<ApplicationStats> {
  // Get counts by status
  const { count: total } = await supabase
    .from('product_applications')
    .select('*', { count: 'exact', head: true })

  const { count: pending } = await supabase
    .from('product_applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: assigned } = await supabase
    .from('product_applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'assigned')

  const { count: processing } = await supabase
    .from('product_applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'processing')

  const { count: completed } = await supabase
    .from('product_applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  const { count: cancelled } = await supabase
    .from('product_applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelled')

  // Get today's count
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: todayCount } = await supabase
    .from('product_applications')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Get this week's count
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { count: weekCount } = await supabase
    .from('product_applications')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString())

  // Get this month's count
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const { count: monthCount } = await supabase
    .from('product_applications')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthAgo.toISOString())

  // Get by template
  const { data: templateData } = await supabase
    .from('product_applications')
    .select('template_id')

  const templateCounts: Record<string, number> = {}
  ;(templateData || []).forEach((app: any) => {
    if (app.template_id) {
      templateCounts[app.template_id] = (templateCounts[app.template_id] || 0) + 1
    }
  })

  // Fetch template titles
  const templateIds = Object.keys(templateCounts)
  let byTemplate: Array<{ template_id: string; template_title: string; count: number }> = []

  if (templateIds.length > 0) {
    const { data: templates } = await supabase
      .from('admin_sidejob_templates')
      .select('id, title')
      .in('id', templateIds)

    byTemplate = (templates || []).map((t: any) => ({
      template_id: t.id,
      template_title: t.title,
      count: templateCounts[t.id] || 0,
    }))
  }

  return {
    total: total || 0,
    pending: pending || 0,
    assigned: assigned || 0,
    processing: processing || 0,
    completed: completed || 0,
    cancelled: cancelled || 0,
    today: todayCount || 0,
    this_week: weekCount || 0,
    this_month: monthCount || 0,
    by_template: byTemplate,
    by_assignee: [], // TODO: Implement if needed
  }
}

/**
 * 담당자 배정
 */
export async function assignApplication(
  id: string,
  input: ApplicationAssignInput
): Promise<void> {
  const { error } = await supabase
    .from('product_applications')
    .update({
      assigned_to: input.assigned_to,
      assigned_at: new Date().toISOString(),
      status: 'assigned',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error assigning application:', error)
    throw error
  }
}

/**
 * 신청 상태 변경
 */
export async function updateApplicationStatus(
  id: string,
  input: ApplicationStatusUpdateInput
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status: input.status,
    updated_at: new Date().toISOString(),
  }

  if (input.processing_note) {
    updateData.processing_note = input.processing_note
  }

  if (input.status === 'completed') {
    updateData.processed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('product_applications')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating application status:', error)
    throw error
  }
}

/**
 * 신청 완료 처리 (보상 설정 포함)
 */
export async function completeApplication(
  id: string,
  input: ApplicationCompleteInput
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status: 'completed',
    processed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (input.processing_note) {
    updateData.processing_note = input.processing_note
  }

  if (input.referrer_reward_type) {
    updateData.referrer_reward_type = input.referrer_reward_type
    updateData.referrer_reward_amount = input.referrer_reward_amount || 0
    updateData.referrer_reward_status = input.referrer_reward_status || 'pending'
  }

  const { error } = await supabase
    .from('product_applications')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error completing application:', error)
    throw error
  }

  // Log reward set action
  if (input.referrer_reward_type && input.referrer_reward_type !== 'none') {
    await supabase.from('application_logs').insert({
      application_id: id,
      action: 'reward_set',
      new_status: 'completed',
      details: {
        reward_type: input.referrer_reward_type,
        reward_amount: input.referrer_reward_amount,
        reward_status: input.referrer_reward_status,
      },
    })
  }
}

/**
 * 신청 취소
 */
export async function cancelApplication(
  id: string,
  note?: string
): Promise<void> {
  const { error } = await supabase
    .from('product_applications')
    .update({
      status: 'cancelled',
      processing_note: note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error cancelling application:', error)
    throw error
  }
}

/**
 * 신청 처리 로그 조회
 */
export async function fetchApplicationLogs(applicationId: string): Promise<ApplicationLog[]> {
  const { data, error } = await supabase
    .from('application_logs')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching application logs:', error)
    throw error
  }

  return (data || []) as ApplicationLog[]
}

/**
 * 관리자 목록 조회 (담당자 배정용)
 */
export async function fetchAdminUsers(): Promise<Array<{ id: string; name: string; email: string }>> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, name, email')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching admin users:', error)
    throw error
  }

  return data || []
}

/**
 * 템플릿 목록 조회 (필터용)
 */
export async function fetchTemplatesForFilter(): Promise<Array<{ id: string; title: string }>> {
  const { data, error } = await supabase
    .from('admin_sidejob_templates')
    .select('id, title')
    .eq('is_active', true)
    .eq('application_enabled', true)
    .order('title')

  if (error) {
    console.error('Error fetching templates:', error)
    throw error
  }

  return data || []
}

/**
 * 보상 상태 업데이트
 */
export async function updateRewardStatus(
  id: string,
  status: 'pending' | 'approved' | 'paid'
): Promise<void> {
  const { error } = await supabase
    .from('product_applications')
    .update({
      referrer_reward_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating reward status:', error)
    throw error
  }
}
