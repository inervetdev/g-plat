import { Eye, Trash2, Edit, QrCode } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { CardWithUser } from '@/lib/api/cards'

interface CardsGridViewProps {
  cards: CardWithUser[]
  selectedCards: Set<string>
  onSelectCard: (cardId: string) => void
  onEdit: (cardId: string) => void
  onDelete: (cardId: string) => void
}

export function CardsGridView({ cards, selectedCards, onSelectCard, onEdit, onDelete }: CardsGridViewProps) {
  const navigate = useNavigate()

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 border border-gray-100 text-center">
        <p className="text-gray-500 text-lg">명함이 없습니다</p>
      </div>
    )
  }

  const getThemeColor = (theme: string | null) => {
    switch (theme) {
      case 'trendy':
        return 'from-purple-500 to-pink-600'
      case 'apple':
        return 'from-gray-700 to-gray-900'
      case 'professional':
        return 'from-blue-600 to-blue-800'
      case 'simple':
        return 'from-green-500 to-emerald-600'
      default:
        return 'from-blue-500 to-purple-600'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`bg-white rounded-xl shadow border-2 transition hover:shadow-lg ${
            selectedCards.has(card.id) ? 'border-blue-500' : 'border-gray-100'
          }`}
        >
          {/* Checkbox */}
          <div className="p-4 pb-0">
            <input
              type="checkbox"
              checked={selectedCards.has(card.id)}
              onChange={() => onSelectCard(card.id)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>

          {/* Card Preview */}
          <div
            onClick={() => navigate(`/cards/${card.id}`)}
            className={`aspect-video bg-gradient-to-br ${getThemeColor(
              card.theme
            )} p-6 flex flex-col justify-between text-white m-4 rounded-lg cursor-pointer hover:opacity-90 transition`}
          >
            <div>
              <h3 className="text-xl font-bold">{card.name || '이름 없음'}</h3>
              {card.company && <p className="text-sm opacity-90 mt-1">{card.company}</p>}
              {card.position && <p className="text-sm opacity-90">{card.position}</p>}
            </div>
            <div className="text-xs opacity-75">{card.theme || 'default'} 테마</div>
          </div>

          {/* Info */}
          <div className="p-4">
            {/* User */}
            {card.users && (
              <div className="mb-3">
                <p className="text-xs text-gray-600">소유자</p>
                <p className="text-sm font-medium text-gray-900">{card.users.name}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <p className="text-xs text-gray-600">조회수</p>
                <p className="font-semibold text-gray-900">{card.view_count || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">QR 스캔</p>
                <p className="font-semibold text-gray-900">{card.qr_scan_count || 0}</p>
              </div>
            </div>

            {/* Status */}
            <div className="mb-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  card.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {card.is_active ? '활성' : '비활성'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => navigate(`/cards/${card.id}`)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="미리보기"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(card.id)
                }}
                className="flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="수정"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="flex items-center justify-center px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition"
                title="QR 코드"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(card.id)
                }}
                className="flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Date */}
            <p className="text-xs text-gray-500 mt-3 text-center">
              {new Date(card.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
