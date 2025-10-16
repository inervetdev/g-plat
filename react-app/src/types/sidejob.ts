import { ShoppingCart, GraduationCap, Briefcase, RefreshCw, Gift } from 'lucide-react'

// Primary category types
export type CategoryPrimary = 'shopping' | 'education' | 'service' | 'subscription' | 'promotion'

// Category metadata interface
export interface CategoryMeta {
  label: string
  color: string
  icon: any // lucide-react icon component
  description: string
}

// Primary category configuration
export const CATEGORY_CONFIG: Record<CategoryPrimary, CategoryMeta> = {
  shopping: {
    label: '🛒 쇼핑/판매',
    color: '#3B82F6',
    icon: ShoppingCart,
    description: '물리적 상품 판매 페이지로 연결'
  },
  education: {
    label: '🎓 교육/콘텐츠',
    color: '#8B5CF6',
    icon: GraduationCap,
    description: '지식 상품 및 교육 서비스 페이지로 연결'
  },
  service: {
    label: '💼 서비스/예약',
    color: '#10B981',
    icon: Briefcase,
    description: '전문 서비스 제공 페이지로 연결'
  },
  subscription: {
    label: '🔄 구독/멤버십',
    color: '#F59E0B',
    icon: RefreshCw,
    description: '장기 계약형 상품 페이지로 연결'
  },
  promotion: {
    label: '🎁 프로모션/혜택',
    color: '#EF4444',
    icon: Gift,
    description: '할인/프로모션 랜딩 페이지로 연결'
  }
}

// Secondary category options for each primary category
export const CATEGORY_SECONDARY_OPTIONS: Record<CategoryPrimary, string[]> = {
  shopping: ['식품·건강', '패션·뷰티', '생활·가전'],
  education: ['온라인 강의', '1:1 교육', '전자책·자료'],
  service: ['디자인·제작', '생활서비스', '전문 상담'],
  subscription: ['렌탈 상품', '보험·금융', '정기배송'],
  promotion: ['할인쿠폰', '이벤트', '추천·제휴', '부동산·중개', '기타 홍보', '채용·구인']
}

// Default CTA text based on category combination
export const DEFAULT_CTA_BY_CATEGORY: Record<string, string> = {
  // Shopping categories
  'shopping/식품·건강': '상품 보러가기',
  'shopping/패션·뷰티': '쇼핑하기',
  'shopping/생활·가전': '구매하기',

  // Education categories
  'education/온라인 강의': '강의 신청하기',
  'education/1:1 교육': '상담 신청하기',
  'education/전자책·자료': '다운로드하기',

  // Service categories
  'service/디자인·제작': '견적 요청하기',
  'service/생활서비스': '예약하기',
  'service/전문 상담': '상담 예약하기',

  // Subscription categories
  'subscription/렌탈 상품': '렌탈 신청하기',
  'subscription/보험·금융': '상담 신청하기',
  'subscription/정기배송': '구독하기',

  // Promotion categories
  'promotion/할인쿠폰': '쿠폰 받기',
  'promotion/이벤트': '참여하기',
  'promotion/추천·제휴': '혜택 받기',
  'promotion/부동산·중개': '상담 신청하기',
  'promotion/기타 홍보': '둘러보기',
  'promotion/채용·구인': '지원하기'
}

// Helper function to get default CTA text
export function getDefaultCTA(primary?: CategoryPrimary, secondary?: string): string {
  if (!primary || !secondary) return '자세히 보기'

  const key = `${primary}/${secondary}`
  return DEFAULT_CTA_BY_CATEGORY[key] || '자세히 보기'
}

// Tag types for additional metadata
export interface SideJobCardTags {
  price_type?: 'free' | 'paid' | 'trial' | 'negotiable'
  target?: 'individual' | 'business' | 'student' | 'worker' | 'freelancer'
  delivery?: 'online' | 'offline' | 'nationwide' | 'local'
  urgency?: 'always' | 'limited' | 'first_come' | 'ending_soon'
}

// Tag display labels
export const TAG_LABELS = {
  price_type: {
    free: '무료',
    paid: '유료',
    trial: '무료체험',
    negotiable: '가격협의'
  },
  target: {
    individual: '개인',
    business: '기업',
    student: '학생',
    worker: '직장인',
    freelancer: '프리랜서'
  },
  delivery: {
    online: '온라인',
    offline: '오프라인',
    nationwide: '전국배송',
    local: '지역한정'
  },
  urgency: {
    always: '상시',
    limited: '기간한정',
    first_come: '선착순',
    ending_soon: '마감임박'
  }
}

// Extended SideJobCard interface with category fields
export interface SideJobCardWithCategory {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string | null
  price: string | null
  cta_text: string | null
  cta_link: string | null  // Database uses cta_link, not cta_url
  business_card_id: string | null
  display_order: number
  is_active: boolean
  view_count: number
  click_count: number
  category_primary: CategoryPrimary | null
  category_secondary: string | null
  tags: SideJobCardTags | null
  badge: string | null
  expiry_date: string | null
  created_at: string
  updated_at: string
}

// Helper function to check if card is expired
export function isCardExpired(expiryDate: string | null): boolean {
  if (!expiryDate) return false
  return new Date(expiryDate) < new Date()
}

// Helper function to check if card is expiring soon (within 7 days)
export function isCardExpiringSoon(expiryDate: string | null): boolean {
  if (!expiryDate) return false
  const expiry = new Date(expiryDate)
  const now = new Date()
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry >= 0 && daysUntilExpiry <= 7
}
