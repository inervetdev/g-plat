/**
 * Subscription Store
 *
 * Zustand 기반 구독 등급 상태 관리
 */

import { create } from 'zustand'
import { getUserTierLimits, type TierLimits } from '../lib/subscription'

interface SubscriptionState {
  /** 사용자 등급 제한 정보 */
  limits: TierLimits | null

  /** 로딩 상태 */
  loading: boolean

  /** 에러 메시지 */
  error: string | null

  /** 마지막 fetch 시간 (캐싱용) */
  lastFetchTime: number | null

  /** 등급 정보 조회 */
  fetchLimits: (userId: string, force?: boolean) => Promise<void>

  /** 상태 초기화 (로그아웃 시) */
  reset: () => void

  /** 수동 업데이트 (관리자가 등급 변경 시) */
  refetch: (userId: string) => Promise<void>
}

/**
 * 캐시 유효 시간 (밀리초)
 * 5분마다만 재조회
 */
const CACHE_DURATION = 5 * 60 * 1000

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  limits: null,
  loading: false,
  error: null,
  lastFetchTime: null,

  fetchLimits: async (userId: string, force: boolean = false) => {
    const state = get()

    // 캐시 확인 (force가 아니고, 최근 5분 이내 조회했으면 스킵)
    if (
      !force &&
      state.limits &&
      state.lastFetchTime &&
      Date.now() - state.lastFetchTime < CACHE_DURATION
    ) {
      console.log('[subscriptionStore] Using cached limits')
      return
    }

    set({ loading: true, error: null })

    try {
      const limits = await getUserTierLimits(userId)

      if (limits) {
        set({
          limits,
          loading: false,
          error: null,
          lastFetchTime: Date.now()
        })
        console.log('[subscriptionStore] Fetched limits:', limits)
      } else {
        set({
          limits: null,
          loading: false,
          error: '등급 정보를 불러올 수 없습니다',
          lastFetchTime: null
        })
      }
    } catch (error) {
      console.error('[subscriptionStore] Error fetching limits:', error)
      set({
        limits: null,
        loading: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        lastFetchTime: null
      })
    }
  },

  refetch: async (userId: string) => {
    // 강제 재조회 (캐시 무시)
    await get().fetchLimits(userId, true)
  },

  reset: () => {
    console.log('[subscriptionStore] Resetting state')
    set({
      limits: null,
      loading: false,
      error: null,
      lastFetchTime: null
    })
  }
}))
