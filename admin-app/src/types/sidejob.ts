// Admin Sidejob Card Types
// Template-Instance pattern for affiliate partnership sidejob cards

// ============================================================================
// ENUMS (matching database)
// ============================================================================

/**
 * 12 B2B Categories for admin sidejob cards
 */
export type AdminB2BCategory =
  | 'rental'              // 렌탈
  | 'card_terminal'       // 카드단말기
  | 'internet'            // 인터넷
  | 'advertising'         // 광고
  | 'liquor'              // 주류
  | 'insurance'           // 보험
  | 'tax_accounting'      // 세무기장
  | 'policy_funds'        // 정책자금
  | 'tax_refund'          // 세금환급
  | 'flower_delivery'     // 꽃배달
  | 'website_development' // 홈페이지 개발
  | 'marriage_agency'     // 결혼정보

/**
 * Assignment target for sidejob instances
 */
export type AssignmentTarget =
  | 'specific_user'  // 지정 사용자
  | 'free_users'     // 무료 회원 전체
  | 'paid_users'     // 유료 회원 전체
  | 'all_users'      // 전체 회원

/**
 * Instance type (paid vs free user)
 */
export type SidejobInstanceType = 'paid' | 'free'

// ============================================================================
// CATEGORY LABELS (Korean)
// ============================================================================

export const CATEGORY_LABELS: Record<AdminB2BCategory, string> = {
  rental: '렌탈',
  card_terminal: '카드단말기',
  internet: '인터넷',
  advertising: '광고',
  liquor: '주류',
  insurance: '보험',
  tax_accounting: '세무기장',
  policy_funds: '정책자금',
  tax_refund: '세금환급',
  flower_delivery: '꽃배달',
  website_development: '홈페이지 개발',
  marriage_agency: '결혼정보',
}

export const ASSIGNMENT_TARGET_LABELS: Record<AssignmentTarget, string> = {
  specific_user: '지정 사용자',
  free_users: '무료 회원 전체',
  paid_users: '유료 회원 전체',
  all_users: '전체 회원',
}

export const INSTANCE_TYPE_LABELS: Record<SidejobInstanceType, string> = {
  paid: '유료 회원',
  free: '무료 회원',
}

// ============================================================================
// TEMPLATE
// ============================================================================

/**
 * Admin sidejob template - base definition for affiliate cards
 */
export interface AdminSidejobTemplate {
  id: string
  title: string
  description: string | null
  image_url: string | null
  price: string | null
  category: AdminB2BCategory
  cta_text: string
  base_cta_link: string
  partner_name: string | null
  partner_id: string | null
  commission_rate: number
  badge: string | null
  display_priority: number
  is_active: boolean
  total_instances: number
  total_clicks: number
  total_conversions: number
  created_by: string | null
  created_at: string
  updated_at: string
}

/**
 * Template create/update input
 */
export interface AdminSidejobTemplateInput {
  title: string
  description?: string | null
  image_url?: string | null
  price?: string | null
  category: AdminB2BCategory
  cta_text?: string
  base_cta_link: string
  partner_name?: string | null
  partner_id?: string | null
  commission_rate?: number
  badge?: string | null
  display_priority?: number
  is_active?: boolean
}

/**
 * Template with calculated statistics
 */
export interface AdminSidejobTemplateWithStats extends AdminSidejobTemplate {
  conversion_rate: number
  expected_revenue: number
  specific_user_count: number
  free_users_assignment: number
  paid_users_assignment: number
  all_users_assignment: number
}

// ============================================================================
// INSTANCE
// ============================================================================

/**
 * Admin sidejob instance - user-specific or group assignment
 */
export interface AdminSidejobInstance {
  id: string
  user_id: string | null
  business_card_id: string | null
  template_id: string
  assignment_target: AssignmentTarget
  instance_type: SidejobInstanceType
  cta_url: string
  custom_title: string | null
  custom_description: string | null
  custom_image_url: string | null
  custom_price: string | null
  custom_cta_text: string | null
  display_order: number
  is_active: boolean
  view_count: number
  click_count: number
  conversion_count: number
  commission_rate: number
  commission_earned: number
  commission_pending: number
  assigned_at: string
  assigned_by: string | null
  updated_at: string
}

/**
 * Instance create input
 */
export interface AdminSidejobInstanceInput {
  user_id?: string | null
  business_card_id?: string | null
  template_id: string
  assignment_target: AssignmentTarget
  instance_type: SidejobInstanceType
  cta_url: string
  custom_title?: string | null
  custom_description?: string | null
  custom_image_url?: string | null
  custom_price?: string | null
  custom_cta_text?: string | null
  display_order?: number
  is_active?: boolean
  commission_rate?: number
}

/**
 * Instance update input
 */
export interface AdminSidejobInstanceUpdateInput {
  cta_url?: string
  custom_title?: string | null
  custom_description?: string | null
  custom_image_url?: string | null
  custom_price?: string | null
  custom_cta_text?: string | null
  display_order?: number
  is_active?: boolean
  commission_rate?: number
  commission_earned?: number
  commission_pending?: number
}

/**
 * Instance with template data (for display)
 */
export interface AdminSidejobInstanceWithTemplate extends AdminSidejobInstance {
  template: AdminSidejobTemplate
  user?: {
    id: string
    name: string
    email: string
    subscription_tier: string
  }
}

// ============================================================================
// CLICK TRACKING
// ============================================================================

/**
 * Click record
 */
export interface AdminSidejobClick {
  id: string
  instance_id: string
  business_card_id: string | null
  source_user_id: string | null
  source_card_url: string | null
  visitor_ip: string | null
  visitor_id: string | null
  user_agent: string | null
  referrer: string | null
  device_type: 'mobile' | 'tablet' | 'desktop' | 'other' | null
  browser: string | null
  os: string | null
  country: string | null
  city: string | null
  is_conversion: boolean
  conversion_type: string | null
  conversion_value: number | null
  converted_at: string | null
  clicked_at: string
}

// ============================================================================
// FILTERS & PAGINATION
// ============================================================================

export interface TemplateFilters {
  search?: string
  category?: AdminB2BCategory | 'all'
  is_active?: boolean | 'all'
  partner_id?: string
  sort_by?: 'created_at' | 'display_priority' | 'total_clicks' | 'total_conversions'
  sort_order?: 'asc' | 'desc'
}

export interface InstanceFilters {
  template_id?: string
  user_id?: string
  assignment_target?: AssignmentTarget | 'all'
  instance_type?: SidejobInstanceType | 'all'
  is_active?: boolean | 'all'
  sort_by?: 'assigned_at' | 'click_count' | 'conversion_count' | 'display_order'
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

export interface TemplateStats {
  total_templates: number
  active_templates: number
  total_instances: number
  total_clicks: number
  total_conversions: number
  total_expected_revenue: number
  by_category: Array<{
    category: AdminB2BCategory
    count: number
    clicks: number
    conversions: number
  }>
}

export interface InstanceStats {
  total_instances: number
  by_assignment_target: Record<AssignmentTarget, number>
  by_instance_type: Record<SidejobInstanceType, number>
  total_clicks: number
  total_conversions: number
  total_commission_earned: number
  total_commission_pending: number
}
