import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Edit2, Trash2, Eye, EyeOff, MoveUp, MoveDown } from 'lucide-react'

interface SideJobCard {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string | null
  price: string | null
  cta_text: string | null
  cta_url: string | null  // 데이터베이스와 일치하도록 변경
  display_order: number
  is_active: boolean
  view_count: number
  click_count: number
  created_at: string
  updated_at: string
}

export default function SideJobCardsPage() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<SideJobCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState<SideJobCard | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    cta_text: '',
    cta_url: '',  // 변경
    is_active: true
  })

  useEffect(() => {
    fetchSideJobCards()
  }, [])

  const fetchSideJobCards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      const { data, error } = await supabase
        .from('sidejob_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Error fetching sidejob cards:', error)
      } else {
        setCards(data || [])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      const cardData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        price: formData.price || null,
        cta_text: formData.cta_text || null,
        cta_url: formData.cta_url || null,  // 변경
        is_active: formData.is_active,
        display_order: editingCard ? editingCard.display_order : cards.length
      }

      let result
      if (editingCard) {
        result = await supabase
          .from('sidejob_cards')
          .update(cardData)
          .eq('id', editingCard.id)
          .select()
      } else {
        result = await supabase
          .from('sidejob_cards')
          .insert(cardData)
          .select()
      }

      if (result.error) {
        console.error('Error saving card:', result.error)
        alert(`저장 중 오류가 발생했습니다: ${result.error.message}`)
      } else {
        alert(editingCard ? '수정되었습니다!' : '생성되었습니다!')
        setShowForm(false)
        setEditingCard(null)
        setFormData({
          title: '',
          description: '',
          price: '',
          cta_text: '',
          cta_url: '',  // 변경
          is_active: true
        })
        fetchSideJobCards()
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('예상치 못한 오류가 발생했습니다.')
    }
  }

  const handleEdit = (card: SideJobCard) => {
    setEditingCard(card)
    setFormData({
      title: card.title,
      description: card.description || '',
      price: card.price || '',
      cta_text: card.cta_text || '',
      cta_url: card.cta_url || '',  // 변경
      is_active: card.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('sidejob_cards')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting card:', error)
        alert('삭제 중 오류가 발생했습니다.')
      } else {
        alert('삭제되었습니다.')
        fetchSideJobCards()
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

  const toggleActive = async (card: SideJobCard) => {
    try {
      const { error } = await supabase
        .from('sidejob_cards')
        .update({ is_active: !card.is_active })
        .eq('id', card.id)

      if (error) {
        console.error('Error toggling active:', error)
      } else {
        fetchSideJobCards()
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

  const changeOrder = async (card: SideJobCard, direction: 'up' | 'down') => {
    const currentIndex = cards.findIndex(c => c.id === card.id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= cards.length) return

    const otherCard = cards[newIndex]

    try {
      // 두 카드의 순서를 바꿈
      await Promise.all([
        supabase
          .from('sidejob_cards')
          .update({ display_order: otherCard.display_order })
          .eq('id', card.id),
        supabase
          .from('sidejob_cards')
          .update({ display_order: card.display_order })
          .eq('id', otherCard.id)
      ])

      fetchSideJobCards()
    } catch (error) {
      console.error('Error changing order:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">부가명함 관리</h1>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                대시보드로
              </button>
              <button
                onClick={() => {
                  setEditingCard(null)
                  setFormData({
                    title: '',
                    description: '',
                    price: '',
                    cta_text: '',
                    cta_url: '',  // 변경
                    is_active: true
                  })
                  setShowForm(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                새 부가명함 추가
              </button>
            </div>
          </div>

          {/* 부가명함 목록 */}
          {cards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">아직 부가명함이 없습니다.</p>
              <p className="text-sm">사이드 비즈니스를 추가해보세요!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`border rounded-lg p-4 ${
                    card.is_active ? 'border-gray-300' : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{card.title}</h3>
                        {!card.is_active && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            비활성
                          </span>
                        )}
                      </div>
                      {card.description && (
                        <p className="text-gray-600 mb-2">{card.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {card.price && <span>가격: {card.price}</span>}
                        {card.cta_text && <span>CTA: {card.cta_text}</span>}
                        <span>조회: {card.view_count}</span>
                        <span>클릭: {card.click_count}</span>
                      </div>
                    </div>

                    {/* 액션 버튼들 */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeOrder(card, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => changeOrder(card, 'down')}
                        disabled={index === cards.length - 1}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(card)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        {card.is_active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(card)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 추가/수정 폼 */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">
                  {editingCard ? '부가명함 수정' : '새 부가명함 추가'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      제목 *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      설명
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      가격
                    </label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="예: ₩50,000 / 시간"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      CTA 버튼 텍스트
                    </label>
                    <input
                      type="text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      placeholder="예: 문의하기, 구매하기"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      CTA 링크
                    </label>
                    <input
                      type="url"
                      value={formData.cta_url}
                      onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="is_active" className="text-sm">
                      활성화 (명함에 표시)
                    </label>
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingCard(null)
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingCard ? '수정' : '추가'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}