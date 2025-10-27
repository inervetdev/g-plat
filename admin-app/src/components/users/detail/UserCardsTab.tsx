import { Eye, Edit, Trash2, ExternalLink } from 'lucide-react'
import { useUserCards } from '@/hooks/useUsers'

interface UserCardsTabProps {
  userId: string
}

export function UserCardsTab({ userId }: UserCardsTabProps) {
  const { data: cards, isLoading, error } = useUserCards(userId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-8 border border-gray-100">
        <p className="text-red-600 text-center">명함 목록을 불러오는 중 오류가 발생했습니다</p>
        <p className="text-gray-500 text-sm text-center mt-2">{error.message}</p>
      </div>
    )
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 border border-gray-100 text-center">
        <p className="text-gray-500 text-lg">생성된 명함이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition"
        >
          {/* Card Preview */}
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 p-6 flex flex-col justify-between text-white">
            <div>
              <h3 className="text-xl font-bold">{card.name || '이름 없음'}</h3>
              <p className="text-sm opacity-90 mt-1">{card.company || '회사명 없음'}</p>
              <p className="text-sm opacity-90">{card.position || '직책 없음'}</p>
            </div>
            <div className="text-xs opacity-75">
              {card.theme || 'default'} 테마
            </div>
          </div>

          {/* Card Info */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">조회수</p>
                <p className="text-lg font-semibold text-gray-900">{card.view_count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">부가명함</p>
                <p className="text-lg font-semibold text-gray-900">{card.sidejob_count || 0}</p>
              </div>
            </div>

            {/* Custom URL */}
            {card.custom_url && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">커스텀 URL</p>
                <a
                  href={`https://g-plat.com/card/${card.custom_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  g-plat.com/card/{card.custom_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => window.open(`https://g-plat.com/card/${card.custom_url || card.id}`, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Eye className="w-4 h-4" />
                미리보기
              </button>
              <button
                className="flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="편집"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Creation Date */}
            <p className="text-xs text-gray-500 mt-3 text-center">
              생성일: {new Date(card.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
