/**
 * 사용자 부가명함 관리 타입 정의
 * 대상: sidejob_cards 테이블 (사용자가 직접 생성한 부가명함)
 */

// 주요 카테고리 (5개)
export type CategoryPrimary = 'shopping' | 'education' | 'service' | 'subscription' | 'promotion'

// 카테고리 설정
export const CATEGORY_CONFIG: Record<CategoryPrimary, { label: string; color: string; emoji: string }> = {
  shopping: { label: '쇼핑/판매', color: '#3B82F6', emoji: '🛒' },
  education: { label: '교육/콘텐츠', color: '#8B5CF6', emoji: '🎓' },
  service: { label: '서비스/예약', color: '#10B981', emoji: '💼' },
  subscription: { label: '구독/멤버십', color: '#F59E0B', emoji: '🔄' },
  promotion: { label: '프로모션/혜택', color: '#EF4444', emoji: '🎁' },
}

// 세부 카테고리 옵션
export const CATEGORY_SECONDARY_OPTIONS: Record<CategoryPrimary, string[]> = {
  shopping: ['식품·건강', '패션·뷰티', '생활·가전'],
  education: ['온라인 강의', '1:1 교육', '전자책·자료'],
  service: ['디자인·제작', '생활서비스', '전문 상담'],
  subscription: ['렌탈 상품', '보험·금융', '정기배송'],
  promotion: ['할인쿠폰', '이벤트', '추천·제휴', '부동산·중개', '기타 홍보', '채용·구인'],
}

// 태그 타입
export interface UserSidejobTags {
  price_type?: 'free' | 'paid' | 'trial' | 'negotiable'
  target?: 'individual' | 'business' | 'student' | 'worker' | 'freelancer'
  delivery?: 'online' | 'offline' | 'nationwide' | 'local'
  urgency?: 'always' | 'limited' | 'first_come' | 'ending_soon'
}

// 사용자 부가명함 데이터
export interface UserSidejobCard {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string | null
  price: string | null
  cta_text: string | null
  cta_link: string | null
  business_card_id: string | null
  display_order: number
  is_active: boolean
  view_count: number
  click_count: number
  category_primary: CategoryPrimary | null
  category_secondary: string | null
  tags: UserSidejobTags | null
  badge: string | null
  expiry_date: string | null
  created_at: string
  updated_at: string
  // JOIN 데이터
  user?: {
    id: string
    email: string
    raw_user_meta_data?: {
      name?: string
      full_name?: string
    }
  }
  business_card?: {
    id: string
    name: string
    custom_url: string | null
  }
}

// 수정 입력 타입
export interface UserSidejobUpdateInput {
  title?: string
  description?: string | null
  image_url?: string | null
  price?: string | null
  cta_text?: string | null
  cta_link?: string | null
  category_primary?: CategoryPrimary | null
  category_secondary?: string | null
  badge?: string | null
  is_active?: boolean
  display_order?: number
  expiry_date?: string | null
}

// 필터 타입
export interface UserSidejobFilters {
  search?: string
  category?: CategoryPrimary | 'all'
  is_active?: boolean | 'all'
  user_id?: string
  business_card_id?: string
  sort_by?: 'created_at' | 'view_count' | 'click_count' | 'title'
  sort_order?: 'asc' | 'desc'
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number
  per_page: number
}

// 통계 타입
export interface UserSidejobStats {
  total: number
  active: number
  inactive: number
  total_views: number
  total_clicks: number
  by_category: Array<{
    category: CategoryPrimary
    count: number
    views: number
    clicks: number
  }>
}

// 페이지네이션 결과
export interface PaginatedUserSidejobs {
  data: UserSidejobCard[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
