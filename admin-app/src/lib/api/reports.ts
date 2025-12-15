import { supabase } from '@/lib/supabase'
import type {
  Report,
  ReportWithDetails,
  ReportStats,
  ReportFilters,
  ReportActionLog,
  PaginatedResponse,
  PaginationParams,
} from '@/types/admin'

/**
 * 신고 목록 조회 (페이지네이션, 필터링)
 */
export async function fetchReports(
  filters: ReportFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 50 }
): Promise<PaginatedResponse<ReportWithDetails>> {
  const { page, per_page } = pagination
  const offset = (page - 1) * per_page

  let query = supabase
    .from('user_reports')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters.search) {
    query = query.or(
      `description.ilike.%${filters.search}%,reporter_email.ilike.%${filters.search}%`
    )
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.report_type && filters.report_type !== 'all') {
    query = query.eq('report_type', filters.report_type)
  }

  if (filters.severity && filters.severity !== 'all') {
    query = query.eq('severity', filters.severity)
  }

  if (filters.target_type && filters.target_type !== 'all') {
    query = query.eq('target_type', filters.target_type)
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
    console.error('Error fetching reports:', error)
    throw error
  }

  // Fetch target details for each report
  const reportsWithDetails: ReportWithDetails[] = await Promise.all(
    (data || []).map(async (report: any) => {
      let target_card = null
      let target_sidejob = null
      let target_user = null

      if (report.target_type === 'business_card') {
        const { data: card } = await supabase
          .from('business_cards')
          .select('id, name, company, custom_url')
          .eq('id', report.target_id)
          .single()
        target_card = card
      } else if (report.target_type === 'sidejob_card') {
        const { data: sidejob } = await supabase
          .from('sidejob_cards')
          .select('id, title, category')
          .eq('id', report.target_id)
          .single()
        target_sidejob = sidejob
      } else if (report.target_type === 'user') {
        const { data: user } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', report.target_id)
          .single()
        target_user = user
      }

      return {
        ...report,
        reporter: null, // auth.users는 직접 조인 불가
        target_card,
        target_sidejob,
        target_user,
        target_owner: null, // auth.users는 직접 조인 불가
        reviewed_by_admin: null,
      }
    })
  )

  return {
    data: reportsWithDetails,
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

/**
 * 단일 신고 상세 조회
 */
export async function fetchReport(id: string): Promise<ReportWithDetails | null> {
  const { data, error } = await supabase
    .from('user_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching report:', error)
    throw error
  }

  if (!data) return null

  // Fetch target details
  let target_card = null
  let target_sidejob = null
  let target_user = null

  if (data.target_type === 'business_card') {
    const { data: card } = await supabase
      .from('business_cards')
      .select('id, name, company, custom_url')
      .eq('id', data.target_id)
      .single()
    target_card = card
  } else if (data.target_type === 'sidejob_card') {
    const { data: sidejob } = await supabase
      .from('sidejob_cards')
      .select('id, title, category')
      .eq('id', data.target_id)
      .single()
    target_sidejob = sidejob
  } else if (data.target_type === 'user') {
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', data.target_id)
      .single()
    target_user = user
  }

  return {
    ...data,
    reporter: null,
    target_card,
    target_sidejob,
    target_user,
    target_owner: null,
    reviewed_by_admin: null,
  }
}

/**
 * 신고 통계 조회
 */
export async function fetchReportStats(): Promise<ReportStats> {
  // Get counts by status
  const { count: total } = await supabase
    .from('user_reports')
    .select('*', { count: 'exact', head: true })

  const { count: pending } = await supabase
    .from('user_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: investigating } = await supabase
    .from('user_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'investigating')

  const { count: resolved } = await supabase
    .from('user_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'resolved')

  const { count: rejected } = await supabase
    .from('user_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected')

  // Get all reports for grouping
  const { data: allReports } = await supabase
    .from('user_reports')
    .select('report_type, severity, target_type')

  // Group by type
  const byType: Record<string, number> = {}
  const bySeverity: Record<string, number> = {}
  const byTargetType: Record<string, number> = {}

  ;(allReports || []).forEach((report: any) => {
    byType[report.report_type] = (byType[report.report_type] || 0) + 1
    bySeverity[report.severity] = (bySeverity[report.severity] || 0) + 1
    byTargetType[report.target_type] = (byTargetType[report.target_type] || 0) + 1
  })

  // Get recent reports
  const { data: recentData } = await supabase
    .from('user_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    total: total || 0,
    pending: pending || 0,
    investigating: investigating || 0,
    resolved: resolved || 0,
    rejected: rejected || 0,
    by_type: Object.entries(byType).map(([type, count]) => ({ type, count })),
    by_severity: Object.entries(bySeverity).map(([severity, count]) => ({ severity, count })),
    by_target_type: Object.entries(byTargetType).map(([target_type, count]) => ({
      target_type,
      count,
    })),
    recent_reports: (recentData || []) as ReportWithDetails[],
  }
}

/**
 * 신고 상태 변경
 */
export async function updateReportStatus(
  id: string,
  status: Report['status'],
  adminId: string,
  note?: string
): Promise<void> {
  // Get current status
  const { data: current } = await supabase
    .from('user_reports')
    .select('status')
    .eq('id', id)
    .single()

  const oldStatus = current?.status

  // Update status
  const updateData: Partial<Report> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'investigating') {
    updateData.reviewed_by = adminId
    updateData.reviewed_at = new Date().toISOString()
  }

  const { error } = await supabase.from('user_reports').update(updateData).eq('id', id)

  if (error) {
    console.error('Error updating report status:', error)
    throw error
  }

  // Log the action
  await supabase.from('report_action_logs').insert({
    report_id: id,
    admin_id: adminId,
    action: 'status_change',
    old_value: oldStatus,
    new_value: status,
    note,
  })
}

/**
 * 신고 처리 (조치 실행)
 */
export async function resolveReport(
  id: string,
  adminId: string,
  resolution: {
    action: Report['resolution_action']
    note: string
    notify_reporter: boolean
  }
): Promise<void> {
  const { action, note, notify_reporter } = resolution

  // Update report
  const { error } = await supabase
    .from('user_reports')
    .update({
      status: action === 'reject_report' ? 'rejected' : 'resolved',
      resolution_action: action,
      resolution_note: note,
      notify_reporter,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error resolving report:', error)
    throw error
  }

  // Log the action
  await supabase.from('report_action_logs').insert({
    report_id: id,
    admin_id: adminId,
    action: 'resolved',
    new_value: action,
    note,
  })

  // Execute action based on resolution type
  const { data: report } = await supabase
    .from('user_reports')
    .select('target_type, target_id, target_owner_id')
    .eq('id', id)
    .single()

  if (report) {
    if (action === 'delete_content' || action === 'disable_content') {
      // Disable content
      if (report.target_type === 'business_card') {
        await supabase
          .from('business_cards')
          .update({ is_active: false })
          .eq('id', report.target_id)
      } else if (report.target_type === 'sidejob_card') {
        await supabase
          .from('sidejob_cards')
          .update({ is_active: false })
          .eq('id', report.target_id)
      }
    } else if (action === 'suspend_user' || action === 'ban_user') {
      // Suspend user
      if (report.target_owner_id) {
        await supabase
          .from('users')
          .update({ status: 'suspended' })
          .eq('id', report.target_owner_id)
      }
    }
  }
}

/**
 * 신고 처리 로그 조회
 */
export async function fetchReportLogs(reportId: string): Promise<ReportActionLog[]> {
  const { data, error } = await supabase
    .from('report_action_logs')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching report logs:', error)
    throw error
  }

  return (data || []) as ReportActionLog[]
}

/**
 * 신고 삭제 (관리자용)
 */
export async function deleteReport(id: string): Promise<void> {
  // First delete logs
  const { error: logsError } = await supabase
    .from('report_action_logs')
    .delete()
    .eq('report_id', id)

  if (logsError) {
    console.error('Error deleting report logs:', logsError)
    throw logsError
  }

  // Then delete the report
  const { error } = await supabase.from('user_reports').delete().eq('id', id)

  if (error) {
    console.error('Error deleting report:', error)
    throw error
  }
}
