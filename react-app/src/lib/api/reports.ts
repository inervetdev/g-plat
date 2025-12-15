import { supabase } from '@/lib/supabase'

export interface ReportData {
  target_type: 'business_card' | 'sidejob_card' | 'user'
  target_id: string
  target_owner_id?: string
  report_type: 'spam' | 'inappropriate' | 'fraud' | 'copyright' | 'privacy' | 'other'
  description?: string
  reporter_email?: string
  notify_reporter?: boolean
}

/**
 * 콘텐츠 신고 제출
 * NOTE: user_reports 테이블은 DB 마이그레이션 적용 후 사용 가능
 */
export async function submitReport(data: ReportData): Promise<{ id: string }> {
  // 현재 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: result, error } = await (supabase as any)
    .from('user_reports')
    .insert({
      reporter_id: user?.id || null,
      reporter_email: data.reporter_email || user?.email || null,
      target_type: data.target_type,
      target_id: data.target_id,
      target_owner_id: data.target_owner_id || null,
      report_type: data.report_type,
      description: data.description || null,
      notify_reporter: data.notify_reporter ?? true,
      severity: 'medium', // 기본값
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error submitting report:', error)
    throw error
  }

  return result
}

/**
 * 동일 대상에 대한 신고 중복 확인
 */
export async function checkDuplicateReport(
  targetType: string,
  targetId: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('user_reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .in('status', ['pending', 'investigating'])
    .limit(1)

  if (error) {
    console.error('Error checking duplicate report:', error)
    return false
  }

  return (data?.length ?? 0) > 0
}
