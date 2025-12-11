/**
 * TierLimitBadge Component
 *
 * 등급 제한 배지
 * 명함/부가명함 사용량 표시
 */

import { Crown } from 'lucide-react'
import { type TierLimits } from '../lib/subscription'

interface TierLimitBadgeProps {
  limits: TierLimits
  type: 'cards' | 'sidejobs'
  className?: string
  showLabel?: boolean
}

export function TierLimitBadge({
  limits,
  type,
  className = '',
  showLabel = true
}: TierLimitBadgeProps) {
  const used = type === 'cards' ? limits.cardsUsed : limits.sidejobsUsed
  const max = type === 'cards' ? limits.maxCards : limits.maxSidejobs
  const label = type === 'cards' ? '명함' : '부가명함'

  // 무제한인 경우
  if (max === 999999 || max === Infinity) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-purple-100 text-purple-700 border-purple-300 ${className}`}
      >
        <Crown className="w-4 h-4" />
        <span className="text-sm font-medium">
          {showLabel && `${label} `}
          {used} / ∞
        </span>
      </div>
    )
  }

  // Grandfathered 사용자
  if (limits.grandfathered && used > max) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-orange-100 text-orange-700 border-orange-300 ${className}`}
      >
        <Crown className="w-4 h-4" />
        <span className="text-sm font-medium">
          {showLabel && `${label} `}
          {used} (특별 혜택)
        </span>
      </div>
    )
  }

  // 사용률 계산
  const percentage = (used / max) * 100
  const isNearLimit = percentage >= 80
  const isAtLimit = used >= max

  // 색상 결정
  const colorClass = isAtLimit
    ? 'bg-red-100 text-red-700 border-red-300'
    : isNearLimit
    ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
    : 'bg-blue-100 text-blue-700 border-blue-300'

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorClass} ${className}`}
    >
      <Crown className="w-4 h-4" />
      <span className="text-sm font-medium">
        {showLabel && `${label} `}
        {used} / {max}
        {isAtLimit && ' (제한 도달)'}
      </span>
    </div>
  )
}

/**
 * 간단한 진행 바 포함 버전
 */
export function TierLimitBadgeWithProgress({
  limits,
  type,
  className = ''
}: Omit<TierLimitBadgeProps, 'showLabel'>) {
  const used = type === 'cards' ? limits.cardsUsed : limits.sidejobsUsed
  const max = type === 'cards' ? limits.maxCards : limits.maxSidejobs
  const label = type === 'cards' ? '명함' : '부가명함'

  // 무제한 또는 grandfathered인 경우 일반 배지 표시
  if (max === 999999 || max === Infinity || (limits.grandfathered && used > max)) {
    return <TierLimitBadge limits={limits} type={type} className={className} />
  }

  const percentage = Math.min(100, (used / max) * 100)
  const isNearLimit = percentage >= 80
  const isAtLimit = used >= max

  const barColorClass = isAtLimit
    ? 'bg-red-600'
    : isNearLimit
    ? 'bg-yellow-600'
    : 'bg-blue-600'

  const bgColorClass = isAtLimit
    ? 'bg-red-100'
    : isNearLimit
    ? 'bg-yellow-100'
    : 'bg-blue-100'

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {used} / {max}
        </span>
      </div>
      <div className={`w-full h-2 ${bgColorClass} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${barColorClass} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
