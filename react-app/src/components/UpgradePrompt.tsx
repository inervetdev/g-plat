/**
 * UpgradePrompt Component
 *
 * 업그레이드 프롬프트 UI
 * 제한 도달 시 상위 플랜으로 업그레이드 유도
 */

import { Crown, ArrowRight, Check } from 'lucide-react'
import { TIER_CONFIG, type SubscriptionTier, getNextTier } from '../lib/subscription'

interface UpgradePromptProps {
  currentTier: SubscriptionTier
  feature: 'cards' | 'sidejobs' | 'callbacks' | 'stats'
  onClose?: () => void
}

const FEATURE_MESSAGES = {
  cards: '더 많은 명함을 생성하려면 업그레이드가 필요합니다.',
  sidejobs: '더 많은 부가명함을 생성하려면 업그레이드가 필요합니다.',
  callbacks: '콜백 기능은 유료 플랜 이상에서 사용할 수 있습니다.',
  stats: '고급 통계는 유료 플랜 이상에서 확인할 수 있습니다.'
}

export function UpgradePrompt({ currentTier, feature, onClose }: UpgradePromptProps) {
  const nextTier = getNextTier(currentTier)

  if (!nextTier) {
    // 이미 최고 등급인 경우
    return (
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <p className="text-gray-600 text-center">
          현재 최고 등급({TIER_CONFIG[currentTier].displayName})을 사용 중입니다.
        </p>
      </div>
    )
  }

  const tierInfo = TIER_CONFIG[nextTier]

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md">
          <Crown className="w-6 h-6 text-white" />
        </div>

        {/* 내용 */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {tierInfo.displayName} 플랜으로 업그레이드
          </h3>
          <p className="text-gray-600 mb-4">{FEATURE_MESSAGES[feature]}</p>

          {/* 가격 및 기능 */}
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-blue-600">{tierInfo.price.split('/')[0]}</span>
              <span className="text-gray-500 text-sm">/ 월</span>
            </div>

            <ul className="space-y-2">
              {tierInfo.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                // TODO: 결제 페이지로 이동 (Phase 2에서 구현)
                alert('결제 시스템은 추후 연동 예정입니다.\n관리자에게 문의해주세요.')
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition shadow-md hover:shadow-lg"
            >
              업그레이드하기
              <ArrowRight className="w-4 h-4" />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 transition"
              >
                나중에
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
