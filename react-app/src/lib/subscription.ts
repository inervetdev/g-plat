/**
 * Subscription Tier Management Library
 *
 * 구독 등급별 제한 관리 및 API 호출
 */

import { supabase } from './supabase'

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'BUSINESS'

export interface TierLimits {
  tier: SubscriptionTier
  maxCards: number
  maxSidejobs: number
  hasCallbacks: boolean
  hasAdvancedStats: boolean
  cardsUsed: number
  sidejobsUsed: number
  grandfathered: boolean
}

/** RPC 함수 반환 타입 */
interface GetUserTierLimitsResponse {
  tier: SubscriptionTier
  max_cards: number
  max_sidejobs: number
  has_callbacks: boolean
  has_advanced_stats: boolean
  cards_used: number
  sidejobs_used: number
  grandfathered: boolean
}

export interface TierConfig {
  displayName: string
  cardLimit: number
  sidejobLimit: number
  hasCallbacks: boolean
  hasAdvancedStats: boolean
  price: string
  features: string[]
}

/**
 * 등급별 설정
 * DB enum과 매핑:
 * - FREE = 무료
 * - PREMIUM = 유료
 * - BUSINESS = 프리미엄
 */
export const TIER_CONFIG: Record<SubscriptionTier, TierConfig> = {
  FREE: {
    displayName: '무료',
    cardLimit: 3,
    sidejobLimit: 5,
    hasCallbacks: false,
    hasAdvancedStats: false,
    price: '₩0/월',
    features: [
      '명함 3개',
      '부가명함 5개',
      '기본 통계만 제공',
      '콜백 미제공'
    ]
  },
  PREMIUM: {
    displayName: '유료',
    cardLimit: 10,
    sidejobLimit: 30,
    hasCallbacks: true,
    hasAdvancedStats: true,
    price: '₩9,900/월',
    features: [
      '명함 10개',
      '부가명함 30개',
      '전체 통계 제공',
      '콜백 기능 제공',
      '우선 지원'
    ]
  },
  BUSINESS: {
    displayName: '프리미엄',
    cardLimit: Infinity,
    sidejobLimit: Infinity,
    hasCallbacks: true,
    hasAdvancedStats: true,
    price: '₩29,900/월',
    features: [
      '무제한 명함',
      '무제한 부가명함',
      '전체 통계 및 분석',
      '무제한 콜백',
      '전담 지원',
      '프리미엄 특화 서비스'
    ]
  }
} as const

/**
 * 사용자 등급 제한 정보 조회
 *
 * @param userId - 사용자 ID
 * @returns 등급별 제한 정보 및 현재 사용량
 */
export async function getUserTierLimits(userId: string): Promise<TierLimits | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc('get_user_tier_limits', { p_user_id: userId })
      .single()

    if (error) {
      console.error('[subscription] Error fetching tier limits:', error)
      return null
    }

    if (!data) {
      console.warn('[subscription] No data returned for user:', userId)
      return null
    }

    const response = data as GetUserTierLimitsResponse

    return {
      tier: response.tier as SubscriptionTier,
      maxCards: response.max_cards,
      maxSidejobs: response.max_sidejobs,
      hasCallbacks: response.has_callbacks,
      hasAdvancedStats: response.has_advanced_stats,
      cardsUsed: response.cards_used,
      sidejobsUsed: response.sidejobs_used,
      grandfathered: response.grandfathered
    }
  } catch (error) {
    console.error('[subscription] Exception in getUserTierLimits:', error)
    return null
  }
}

/**
 * 명함 생성 가능 여부 확인
 *
 * @param limits - 사용자 등급 제한 정보
 * @returns 명함 생성 가능 여부
 */
export function canCreateCard(limits: TierLimits | null): boolean {
  if (!limits) return false
  if (limits.grandfathered) return true
  return limits.cardsUsed < limits.maxCards
}

/**
 * 부가명함 생성 가능 여부 확인
 *
 * @param limits - 사용자 등급 제한 정보
 * @returns 부가명함 생성 가능 여부
 */
export function canCreateSidejob(limits: TierLimits | null): boolean {
  if (!limits) return false
  if (limits.grandfathered) return true
  return limits.sidejobsUsed < limits.maxSidejobs
}

/**
 * 남은 슬롯 개수 계산
 *
 * @param limits - 사용자 등급 제한 정보
 * @param type - 명함 또는 부가명함
 * @returns 남은 슬롯 개수 (Infinity 가능)
 */
export function getRemainingSlots(
  limits: TierLimits | null,
  type: 'cards' | 'sidejobs'
): number {
  if (!limits) return 0
  if (limits.grandfathered) return Infinity

  const used = type === 'cards' ? limits.cardsUsed : limits.sidejobsUsed
  const max = type === 'cards' ? limits.maxCards : limits.maxSidejobs

  if (max === Infinity) return Infinity
  return Math.max(0, max - used)
}

/**
 * 사용률 퍼센트 계산
 *
 * @param limits - 사용자 등급 제한 정보
 * @param type - 명함 또는 부가명함
 * @returns 사용률 (0-100)
 */
export function getUsagePercentage(
  limits: TierLimits | null,
  type: 'cards' | 'sidejobs'
): number {
  if (!limits) return 0
  if (limits.grandfathered) return 0

  const used = type === 'cards' ? limits.cardsUsed : limits.sidejobsUsed
  const max = type === 'cards' ? limits.maxCards : limits.maxSidejobs

  if (max === Infinity) return 0
  return Math.min(100, Math.round((used / max) * 100))
}

/**
 * 업그레이드 가능 여부
 *
 * @param tier - 현재 등급
 * @returns 업그레이드 가능 여부
 */
export function canUpgrade(tier: SubscriptionTier): boolean {
  return tier !== 'BUSINESS'
}

/**
 * 다음 등급 반환
 *
 * @param tier - 현재 등급
 * @returns 다음 등급 (업그레이드 불가 시 null)
 */
export function getNextTier(tier: SubscriptionTier): SubscriptionTier | null {
  switch (tier) {
    case 'FREE':
      return 'PREMIUM'
    case 'PREMIUM':
      return 'BUSINESS'
    case 'BUSINESS':
      return null
  }
}

/**
 * 등급 표시 이름
 *
 * @param tier - 등급
 * @returns 한글 표시명
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  return TIER_CONFIG[tier].displayName
}

/**
 * 제한에 근접했는지 확인 (80% 이상)
 *
 * @param limits - 사용자 등급 제한 정보
 * @param type - 명함 또는 부가명함
 * @returns 제한에 근접 여부
 */
export function isNearLimit(
  limits: TierLimits | null,
  type: 'cards' | 'sidejobs'
): boolean {
  const percentage = getUsagePercentage(limits, type)
  return percentage >= 80
}

/**
 * 제한 도달 여부 확인 (100%)
 *
 * @param limits - 사용자 등급 제한 정보
 * @param type - 명함 또는 부가명함
 * @returns 제한 도달 여부
 */
export function isAtLimit(
  limits: TierLimits | null,
  type: 'cards' | 'sidejobs'
): boolean {
  if (!limits) return true
  if (limits.grandfathered) return false

  const used = type === 'cards' ? limits.cardsUsed : limits.sidejobsUsed
  const max = type === 'cards' ? limits.maxCards : limits.maxSidejobs

  return used >= max
}
