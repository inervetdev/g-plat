// Admin Sidejob Types for React App (User-facing)
// 제휴 부가명함 타입 정의 (사용자 화면용)

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
 * Category configuration for display
 */
export const ADMIN_CATEGORY_CONFIG: Record<AdminB2BCategory, {
  label: string
  color: string
  icon: string
}> = {
  rental: { label: '렌탈', color: '#6366f1', icon: '📦' },
  card_terminal: { label: '카드단말기', color: '#22c55e', icon: '💳' },
  internet: { label: '인터넷', color: '#3b82f6', icon: '🌐' },
  advertising: { label: '광고', color: '#f59e0b', icon: '📢' },
  liquor: { label: '주류', color: '#ef4444', icon: '🍷' },
  insurance: { label: '보험', color: '#8b5cf6', icon: '🛡️' },
  tax_accounting: { label: '세무기장', color: '#14b8a6', icon: '📊' },
  policy_funds: { label: '정책자금', color: '#ec4899', icon: '💰' },
  tax_refund: { label: '세금환급', color: '#06b6d4', icon: '💵' },
  flower_delivery: { label: '꽃배달', color: '#f43f5e', icon: '💐' },
  website_development: { label: '홈페이지 개발', color: '#84cc16', icon: '🖥️' },
  marriage_agency: { label: '결혼정보', color: '#d946ef', icon: '💍' },
}

/**
 * Admin sidejob card data for display
 */
export interface AdminSidejobDisplayCard {
  instance_id: string
  template_id: string
  title: string
  description: string | null
  image_url: string | null
  price: string | null
  cta_text: string
  cta_url: string
  category: AdminB2BCategory
  badge: string | null
  partner_name: string | null
  display_order: number
  application_enabled: boolean
}

/**
 * Admin sidejob cards grouped by category
 */
export interface AdminSidejobsByCategory {
  category: AdminB2BCategory
  cards: AdminSidejobDisplayCard[]
}
