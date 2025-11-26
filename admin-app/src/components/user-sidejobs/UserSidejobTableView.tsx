/**
 * 사용자 부가명함 테이블 뷰 컴포넌트
 */

import { useState, useRef, useEffect } from 'react'
import {
  MoreVertical,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'
import type { UserSidejobCard } from '@/types/userSidejob'
import { CATEGORY_CONFIG } from '@/types/userSidejob'

interface UserSidejobTableViewProps {
  cards: UserSidejobCard[]
  onEdit: (card: UserSidejobCard) => void
  onDelete: (card: UserSidejobCard) => void
  onToggleActive: (card: UserSidejobCard) => void
}

export function UserSidejobTableView({
  cards,
  onEdit,
  onDelete,
  onToggleActive,
}: UserSidejobTableViewProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getUserName = (card: UserSidejobCard) => {
    if (card.user?.raw_user_meta_data?.name) {
      return card.user.raw_user_meta_data.name
    }
    if (card.user?.raw_user_meta_data?.full_name) {
      return card.user.raw_user_meta_data.full_name
    }
    return card.user?.email?.split('@')[0] || '알 수 없음'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                부가명함
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                사용자
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                명함
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                조회수
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                클릭수
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cards.map((card) => {
              const categoryConfig = card.category_primary
                ? CATEGORY_CONFIG[card.category_primary]
                : null

              return (
                <tr key={card.id} className="hover:bg-gray-50">
                  {/* 부가명함 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {card.image_url ? (
                          <img
                            src={card.image_url}
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">
                          {card.title}
                        </p>
                        {card.price && (
                          <p className="text-sm text-blue-600">{card.price}</p>
                        )}
                        {card.badge && (
                          <span className="inline-block px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded mt-1">
                            {card.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 카테고리 */}
                  <td className="px-4 py-3">
                    {categoryConfig ? (
                      <span
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded whitespace-nowrap"
                        style={{
                          backgroundColor: `${categoryConfig.color}15`,
                          color: categoryConfig.color,
                        }}
                      >
                        {categoryConfig.emoji} {categoryConfig.label}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">미설정</span>
                    )}
                  </td>

                  {/* 사용자 */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{getUserName(card)}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {card.user?.email}
                    </p>
                  </td>

                  {/* 명함 */}
                  <td className="px-4 py-3">
                    {card.business_card ? (
                      <p className="text-sm text-gray-900">
                        {card.business_card.name}
                      </p>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* 조회수 */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-600">
                      {card.view_count.toLocaleString()}
                    </span>
                  </td>

                  {/* 클릭수 */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-600">
                      {card.click_count.toLocaleString()}
                    </span>
                  </td>

                  {/* 상태 */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        card.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {card.is_active ? '활성' : '비활성'}
                    </span>
                  </td>

                  {/* 생성일 */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {formatDate(card.created_at)}
                    </span>
                  </td>

                  {/* 액션 */}
                  <td className="px-4 py-3 text-center">
                    <div className="relative inline-block" ref={openMenuId === card.id ? menuRef : null}>
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === card.id ? null : card.id)
                        }
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {openMenuId === card.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => {
                              onEdit(card)
                              setOpenMenuId(null)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            편집
                          </button>
                          <button
                            onClick={() => {
                              onToggleActive(card)
                              setOpenMenuId(null)
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
                              setOpenMenuId(null)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {cards.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          부가명함이 없습니다.
        </div>
      )}
    </div>
  )
}
