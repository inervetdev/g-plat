// Admin Sidejob Cards Component
// 제휴 부가명함 표시 컴포넌트 (사용자 화면용)
// 카테고리별 박스로 그룹화하여 표시

import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
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
  cardUrl?: string  // custom_url for referrer tracking
  className?: string
}

export default function AdminSidejobCards({
  userId,
  businessCardId,
  cardUrl,
  className = '',
}: AdminSidejobCardsProps) {
  const [loading, setLoading] = useState(true)
  const [sidejobsByCategory, setSidejobsByCategory] = useState<AdminSidejobsByCategory[]>([])
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string } | null>(null)

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

    // If application is enabled, navigate to application form
    if (card.application_enabled) {
      const applicationUrl = cardUrl
        ? `/apply/${card.template_id}/${cardUrl}`
        : `/apply/${card.template_id}`
      window.location.href = applicationUrl
      return
    }

    // Otherwise open CTA link in new tab
    window.open(card.cta_url, '_blank', 'noopener,noreferrer')
  }, [businessCardId, userId, cardUrl])

  const handleImageClick = useCallback((card: AdminSidejobDisplayCard, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    if (card.image_url) {
      setViewingImage({ url: card.image_url, title: card.title })
    }
  }, [])

  if (loading) {
    return null // Don't show loading state to avoid layout shift
  }

  if (sidejobsByCategory.length === 0) {
    return null // No admin sidejobs assigned
  }

  return (
    <div className={`bg-gray-50 ${className}`}>
      {/* Section Title */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">추천 서비스</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">비즈니스에 도움이 되는 제휴 서비스</p>
      </div>

      {/* Category Boxes */}
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {sidejobsByCategory.map(({ category, cards }) => (
          <CategoryBox
            key={category}
            category={category}
            cards={cards}
            onCardClick={handleCardClick}
            onImageClick={handleImageClick}
          />
        ))}
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <ImageViewerModal
          imageUrl={viewingImage.url}
          title={viewingImage.title}
          onClose={() => setViewingImage(null)}
        />
      )}
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
  onImageClick: (card: AdminSidejobDisplayCard, e: React.MouseEvent) => void
}

function CategoryBox({ category, cards, onCardClick, onImageClick }: CategoryBoxProps) {
  const config = ADMIN_CATEGORY_CONFIG[category]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Category Header */}
      <div
        className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-1.5 sm:gap-2"
        style={{ backgroundColor: `${config.color}10` }}
      >
        <span className="text-lg sm:text-xl">{config.icon}</span>
        <span
          className="text-sm sm:text-base font-semibold"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
        <span className="text-[10px] sm:text-xs text-gray-500 ml-auto">
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
            onImageClick={(e) => onImageClick(card, e)}
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
  onImageClick: (e: React.MouseEvent) => void
}

function AdminSidejobCard({ card, onClick, onImageClick }: AdminSidejobCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Image - clickable for popup */}
        {card.image_url && (
          <div
            className="w-16 sm:w-20 h-16 sm:h-20 flex-shrink-0 relative group"
            onClick={onImageClick}
          >
            <img
              src={card.image_url}
              alt={card.title}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badge */}
          {card.badge && (
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-red-500 text-white mb-1.5 sm:mb-2">
              {card.badge}
            </span>
          )}

          {/* Title */}
          <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{card.title}</h4>

          {/* Partner Name */}
          {card.partner_name && (
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{card.partner_name}</p>
          )}

          {/* Description */}
          {card.description && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{card.description}</p>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between mt-1.5 sm:mt-2 gap-1.5 sm:gap-2">
            {card.price && (
              <span className="text-xs sm:text-sm font-bold text-blue-600 truncate flex-1">{card.price}</span>
            )}
            <span className={`text-xs sm:text-sm font-medium flex-shrink-0 ${
              card.application_enabled
                ? 'text-green-600 hover:text-green-700'
                : 'text-blue-600 hover:text-blue-700'
            }`}>
              {card.application_enabled ? '신청하기' : card.cta_text} →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Image Viewer Modal Component
// ============================================================================

interface ImageViewerModalProps {
  imageUrl: string
  title: string
  onClose: () => void
}

function ImageViewerModal({ imageUrl, title, onClose }: ImageViewerModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Title */}
      <div className="absolute top-4 left-4 text-white font-medium text-lg z-10">
        {title}
      </div>

      {/* Image container with scroll for long images */}
      <div
        className="max-w-[90vw] max-h-[85vh] overflow-auto bg-white rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto"
          style={{ maxWidth: '100%' }}
        />
      </div>

      {/* Hint text */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-sm">
        이미지 외부를 클릭하거나 ESC를 눌러 닫기
      </div>
    </div>
  )
}
