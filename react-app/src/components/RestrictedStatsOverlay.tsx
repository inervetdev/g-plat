/**
 * RestrictedStatsOverlay Component
 *
 * 통계 제한 오버레이
 * FREE 플랜 사용자에게 고급 통계를 흐리게 처리하고 업그레이드 안내
 */

import { Lock } from 'lucide-react'
import { UpgradePrompt } from './UpgradePrompt'
import { type SubscriptionTier } from '../lib/subscription'

interface RestrictedStatsOverlayProps {
  currentTier: SubscriptionTier
}

export function RestrictedStatsOverlay({
  currentTier
}: RestrictedStatsOverlayProps) {
  return (
    <div className="relative">
      {/* 흐린 배경 (플레이스홀더) */}
      <div className="filter blur-md pointer-events-none select-none">
        <div className="h-96 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 rounded-lg p-6">
          {/* 가짜 차트 모양 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="h-24 bg-gray-300 rounded-lg animate-pulse" />
            <div className="h-24 bg-gray-300 rounded-lg animate-pulse" />
            <div className="h-24 bg-gray-300 rounded-lg animate-pulse" />
          </div>
          <div className="h-48 bg-gray-300 rounded-lg animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-300 rounded-lg animate-pulse" />
            <div className="h-32 bg-gray-300 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* 오버레이 */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
        <div className="max-w-md p-6 text-center">
          {/* 업그레이드 프롬프트만 표시 */}
          <UpgradePrompt currentTier={currentTier} feature="stats" />
        </div>
      </div>
    </div>
  )
}

/**
 * 간단한 블러 오버레이 (작은 섹션용)
 */
export function SimpleRestrictedOverlay({ message = '유료 플랜 전용' }: { message?: string }) {
  return (
    <div className="relative">
      <div className="filter blur-sm pointer-events-none select-none">
        <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    </div>
  )
}
