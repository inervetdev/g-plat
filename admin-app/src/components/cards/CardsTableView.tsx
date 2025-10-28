import { Eye, Edit, Trash2 } from 'lucide-react'
import type { CardWithUser } from '@/lib/api/cards'

interface CardsTableViewProps {
  cards: CardWithUser[]
  selectedCards: Set<string>
  onSelectCard: (cardId: string) => void
  onSelectAll: () => void
}

export function CardsTableView({
  cards,
  selectedCards,
  onSelectCard,
  onSelectAll,
}: CardsTableViewProps) {
  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 border border-gray-100 text-center">
        <p className="text-gray-500 text-lg">명함이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedCards.size === cards.length && cards.length > 0}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                명함
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                소유자
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                테마
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                조회수
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                QR 스캔
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCards.has(card.id)}
                    onChange={() => onSelectCard(card.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{card.name}</p>
                    {card.company && <p className="text-sm text-gray-500">{card.company}</p>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {card.users && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{card.users.name}</p>
                      <p className="text-xs text-gray-500">{card.users.email}</p>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {card.theme || 'default'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">{card.view_count || 0}</td>
                <td className="px-6 py-4 text-gray-900">{card.qr_scan_count || 0}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      card.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {card.is_active ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(card.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="미리보기"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="수정"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
