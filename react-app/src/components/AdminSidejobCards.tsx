// Admin Sidejob Cards Component
// 제휴 부가명함 표시 컴포넌트 (사용자 화면용)
// 카테고리별 박스로 그룹화하여 표시

import { useEffect, useState, useCallback } from 'react'
import {
  fetchAdminSidejobsForUser,
  groupSidejobsByCategory,
  recordAdminSidejobClick,
} from '../lib/adminSidejobs'
import {
  ADMIN_CATEGORY_CONFIG,
  type AdminSidejobDisplayCard,
  type AdminSidejobsByCategory,
  type AdminB2BCategory,
} from '../types/adminSidejob'

interface AdminSidejobCardsProps {
  userId: string
  businessCardId?: string
  className?: string
}

export default function AdminSidejobCards({
  userId,
  businessCardId,
  className = '',
}: AdminSidejobCardsProps) {
  const [loading, setLoading] = useState(true)
  const [sidejobsByCategory, setSidejobsByCategory] = useState<AdminSidejobsByCategory[]>([])

  useEffect(() => {
    loadAdminSidejobs()
  }, [userId])

  const loadAdminSidejobs = async () => {
    try {
      setLoading(true)
      const cards = await fetchAdminSidejobsForUser(userId)
      const grouped = groupSidejobsByCategory(cards)
      setSidejobsByCategory(grouped)
    } catch (error) {
      console.error('Error loading admin sidejobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = useCallback(async (card: AdminSidejobDisplayCard) => {
    // Record click before navigating
    await recordAdminSidejobClick(card.instance_id, businessCardId, userId)

    // Open link in new tab
    window.open(card.cta_url, '_blank', 'noopener,noreferrer')
  }, [businessCardId, userId])

  if (loading) {
    return null // Don't show loading state to avoid layout shift
  }

  if (sidejobsByCategory.length === 0) {
    return null // No admin sidejobs assigned
  }

  return (
    <div className={`bg-gray-50 ${className}`}>
      {/* Section Title */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">추천 서비스</h3>
        <p className="text-sm text-gray-500 mt-0.5">비즈니스에 도움이 되는 제휴 서비스</p>
      </div>

      {/* Category Boxes */}
      <div className="p-4 space-y-4">
        {sidejobsByCategory.map(({ category, cards }) => (
          <CategoryBox
            key={category}
            category={category}
            cards={cards}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Category Box Component
// ============================================================================

interface CategoryBoxProps {
  category: AdminB2BCategory
  cards: AdminSidejobDisplayCard[]
  onCardClick: (card: AdminSidejobDisplayCard) => void
}

function CategoryBox({ category, cards, onCardClick }: CategoryBoxProps) {
  const config = ADMIN_CATEGORY_CONFIG[category]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Category Header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ backgroundColor: `${config.color}10` }}
      >
        <span className="text-xl">{config.icon}</span>
        <span
          className="font-semibold"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
        <span className="text-xs text-gray-500 ml-auto">
          {cards.length}개
        </span>
      </div>

      {/* Cards in this category */}
      <div className="divide-y divide-gray-100">
        {cards.map((card) => (
          <AdminSidejobCard
            key={card.instance_id}
            card={card}
            onClick={() => onCardClick(card)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Admin Sidejob Card Component
// ============================================================================

interface AdminSidejobCardProps {
  card: AdminSidejobDisplayCard
  onClick: () => void
}

function AdminSidejobCard({ card, onClick }: AdminSidejobCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex gap-4">
        {/* Image */}
        {card.image_url && (
          <div className="w-20 h-20 flex-shrink-0">
            <img
              src={card.image_url}
              alt={card.title}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badge */}
          {card.badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500 text-white mb-2">
              {card.badge}
            </span>
          )}

          {/* Title */}
          <h4 className="font-semibold text-gray-900 truncate">{card.title}</h4>

          {/* Partner Name */}
          {card.partner_name && (
            <p className="text-xs text-gray-500 mt-0.5">{card.partner_name}</p>
          )}

          {/* Description */}
          {card.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{card.description}</p>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between mt-2">
            {card.price && (
              <span className="text-sm font-bold text-blue-600">{card.price}</span>
            )}
            <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
              {card.cta_text} →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
