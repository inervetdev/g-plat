/**
 * 사용자 부가명함 카드 컴포넌트 (그리드 뷰)
 */

import { useState, useRef, useEffect } from 'react'
import {
  MoreVertical,
  Eye,
  MousePointerClick,
  ExternalLink,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
} from 'lucide-react'
import type { UserSidejobCard as UserSidejobCardType } from '@/types/userSidejob'
import { CATEGORY_CONFIG } from '@/types/userSidejob'

interface UserSidejobCardProps {
  card: UserSidejobCardType
  onEdit: (card: UserSidejobCardType) => void
  onDelete: (card: UserSidejobCardType) => void
  onToggleActive: (card: UserSidejobCardType) => void
}

export function UserSidejobCard({
  card,
  onEdit,
  onDelete,
  onToggleActive,
}: UserSidejobCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 외부 클릭으로 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const categoryConfig = card.category_primary
    ? CATEGORY_CONFIG[card.category_primary]
    : null

  const getUserName = () => {
    if (card.user?.raw_user_meta_data?.name) {
      return card.user.raw_user_meta_data.name
    }
    if (card.user?.raw_user_meta_data?.full_name) {
      return card.user.raw_user_meta_data.full_name
    }
    return card.user?.email?.split('@')[0] || '알 수 없음'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* 이미지 영역 */}
      <div className="relative aspect-video bg-gray-100">
        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* 상태 배지 */}
        <div className="absolute top-2 left-2 flex gap-1">
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              card.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {card.is_active ? '활성' : '비활성'}
          </span>
          {card.badge && (
            <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">
              {card.badge}
            </span>
          )}
        </div>

        {/* 더보기 메뉴 */}
        <div className="absolute top-2 right-2" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  onEdit(card)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                편집
              </button>
              <button
                onClick={() => {
                  onToggleActive(card)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                {card.is_active ? (
                  <>
                    <ToggleLeft className="w-4 h-4" />
                    비활성화
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-4 h-4" />
                    활성화
                  </>
                )}
              </button>
              {card.cta_link && (
                <a
                  href={card.cta_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  링크 열기
                </a>
              )}
              <hr className="my-1" />
              <button
                onClick={() => {
                  onDelete(card)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-4">
        {/* 카테고리 */}
        {categoryConfig && (
          <div className="mb-2">
            <span
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded"
              style={{
                backgroundColor: `${categoryConfig.color}15`,
                color: categoryConfig.color,
              }}
            >
              {categoryConfig.emoji} {categoryConfig.label}
            </span>
          </div>
        )}

        {/* 제목 */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
          {card.title}
        </h3>

        {/* 설명 */}
        {card.description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* 가격 */}
        {card.price && (
          <p className="text-sm font-medium text-blue-600 mb-2">{card.price}</p>
        )}

        {/* 사용자 & 명함 */}
        <div className="text-xs text-gray-500 mb-3">
          <p>👤 {getUserName()}</p>
          {card.business_card && (
            <p>📇 {card.business_card.name}</p>
          )}
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{card.view_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MousePointerClick className="w-4 h-4" />
            <span>{card.click_count.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
