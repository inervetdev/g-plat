// Product Application Types for Admin App
// 상품 신청 타입 정의 (관리자용)

// ============================================================================
// STATUS & ENUMS
// ============================================================================

/**
 * 신청 상태
 */
export type ApplicationStatus =
  | 'pending'     // 대기중
  | 'assigned'    // 담당자 배정됨
  | 'processing'  // 처리중
  | 'completed'   // 완료
  | 'cancelled'   // 취소

/**
 * 보상 상태
 */
export type RewardStatus = 'pending' | 'approved' | 'paid'

/**
 * 보상 유형
 */
export type RewardType = 'commission' | 'points' | 'none'

/**
 * 상태 라벨
 */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: '대기중',
  assigned: '배정됨',
  processing: '처리중',
  completed: '완료',
  cancelled: '취소',
}

/**
 * 상태 색상
 */
export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  assigned: { bg: 'bg-blue-100', text: 'text-blue-800' },
  processing: { bg: 'bg-purple-100', text: 'text-purple-800' },
  completed: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-800' },
}

/**
 * 보상 상태 라벨
 */
export const REWARD_STATUS_LABELS: Record<RewardStatus, string> = {
  pending: '대기',
  approved: '승인',
  paid: '지급완료',
}

/**
 * 보상 유형 라벨
 */
export const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  commission: '수수료',
  points: '포인트',
  none: '없음',
}

// ============================================================================
// APPLICATION
// ============================================================================

/**
 * 상품 신청 기본 타입
 */
export interface ProductApplication {
  id: string
  template_id: string | null
  instance_id: string | null
  referrer_user_id: string | null
  referrer_card_id: string | null
  referrer_card_url: string | null
  applicant_user_id: string | null
  applicant_name: string
  applicant_phone: string
  applicant_email: string
  form_data: Record<string, unknown>
  status: ApplicationStatus
  assigned_to: string | null
  assigned_at: string | null
  processed_at: string | null
  processing_note: string | null
  referrer_reward_type: RewardType | null
  referrer_reward_amount: number
  referrer_reward_status: RewardStatus
  visitor_ip: string | null
  user_agent: string | null
  device_type: 'mobile' | 'tablet' | 'desktop' | null
  privacy_agreed: boolean
  privacy_agreed_at: string | null
  created_at: string
  updated_at: string
}

/**
 * 관계 데이터 포함된 신청 타입 (목록/상세용)
 */
export interface ProductApplicationWithRelations extends ProductApplication {
  template?: {
    id: string
    title: string
    image_url: string | null
    category: string
    partner_name: string | null
  } | null
  referrer?: {
    id: string
    email: string
    name: string | null
    card_url: string | null
  } | null
  applicant?: {
    id: string
    email: string
    name: string | null
  } | null
  assignee?: {
    id: string
    name: string
    email: string
  } | null
}

/**
 * 신청 상태 변경 입력
 */
export interface ApplicationStatusUpdateInput {
  status: ApplicationStatus
  processing_note?: string
}

/**
 * 담당자 배정 입력
 */
export interface ApplicationAssignInput {
  assigned_to: string
}

/**
 * 신청 완료 처리 입력
 */
export interface ApplicationCompleteInput {
  processing_note?: string
  referrer_reward_type?: RewardType
  referrer_reward_amount?: number
  referrer_reward_status?: RewardStatus
}

// ============================================================================
// APPLICATION LOG
// ============================================================================

/**
 * 처리 로그 액션 타입
 */
export type ApplicationLogAction =
  | 'created'
  | 'status_changed'
  | 'assigned'
  | 'note_added'
  | 'reward_set'
  | 'completed'

/**
 * 처리 로그
 */
export interface ApplicationLog {
  id: string
  application_id: string
  action: ApplicationLogAction
  previous_status: ApplicationStatus | null
  new_status: ApplicationStatus | null
  details: Record<string, unknown>
  note: string | null
  performed_by: string | null
  performed_by_name: string | null
  created_at: string
}

// ============================================================================
// FORM SCHEMA
// ============================================================================

/**
 * 폼 필드 타입
 */
export type FormFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'select'
  | 'checkbox'
  | 'textarea'
  | 'date'

/**
 * 폼 필드 유효성 검사 규칙
 */
export interface FormFieldValidation {
  pattern?: string
  message?: string
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
}

/**
 * 선택 옵션 (select 타입용)
 */
export interface FormFieldOption {
  value: string
  label: string
}

/**
 * 동적 폼 필드 스키마
 */
export interface FormFieldSchema {
  name: string
  label: string
  type: FormFieldType
  required: boolean
  placeholder?: string
  options?: FormFieldOption[]
  validation?: FormFieldValidation
  defaultValue?: string | number | boolean
  helpText?: string
}

/**
 * 신청 설정
 */
export interface ApplicationSettings {
  reward_type?: RewardType
  reward_amount?: number
  auto_assign?: string | null
  notification_emails?: string[]
  duplicate_check?: boolean
  duplicate_period_days?: number
}

// ============================================================================
// FILTERS & PAGINATION
// ============================================================================

export interface ApplicationFilters {
  search?: string
  status?: ApplicationStatus | 'all'
  template_id?: string
  assigned_to?: string | 'unassigned' | 'all'
  referrer_user_id?: string
  date_from?: string
  date_to?: string
  sort_by?: 'created_at' | 'updated_at' | 'status'
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

// ============================================================================
// STATISTICS
// ============================================================================

export interface ApplicationStats {
  total: number
  pending: number
  assigned: number
  processing: number
  completed: number
  cancelled: number
  today: number
  this_week: number
  this_month: number
  by_template: Array<{
    template_id: string
    template_title: string
    count: number
  }>
  by_assignee: Array<{
    assignee_id: string
    assignee_name: string
    count: number
    completed: number
  }>
}

export interface ReferrerRewardStats {
  total_referrers: number
  total_reward_amount: number
  pending_reward_amount: number
  approved_reward_amount: number
  paid_reward_amount: number
  top_referrers: Array<{
    user_id: string
    user_name: string
    application_count: number
    total_reward: number
  }>
}
