import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Edit2, Trash2, Eye, EyeOff, MoveUp, MoveDown, Filter } from 'lucide-react'
import SideJobCardForm from '../components/SideJobCardForm'
import type { CategoryPrimary, SideJobCardWithCategory } from '../types/sidejob'
import { CATEGORY_CONFIG } from '../types/sidejob'

export default function SideJobCardsPage() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<SideJobCardWithCategory[]>([])
  const [filteredCards, setFilteredCards] = useState<SideJobCardWithCategory[]>([])
  const [businessCards, setBusinessCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState<SideJobCardWithCategory | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryPrimary | 'all'>('all')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Apply category filter
    if (categoryFilter === 'all') {
      setFilteredCards(cards)
    } else {
      setFilteredCards(cards.filter(card => card.category_primary === categoryFilter))
    }
  }, [cards, categoryFilter])

  const fetchData = async () => {
    await Promise.all([fetchSideJobCards(), fetchBusinessCards()])
  }

  const fetchBusinessCards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('business_cards')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching business cards:', error)
      } else {
        setBusinessCards(data || [])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

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

  const handleEdit = (card: SideJobCardWithCategory) => {
    setEditingCard(card)
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

  const toggleActive = async (card: SideJobCardWithCategory) => {
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

  const changeOrder = async (card: SideJobCardWithCategory, direction: 'up' | 'down') => {
    const currentIndex = filteredCards.findIndex(c => c.id === card.id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= filteredCards.length) return

    const otherCard = filteredCards[newIndex]

    try {
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

  const getCategoryBadge = (card: SideJobCardWithCategory) => {
    if (!card.category_primary) return null

    const config = CATEGORY_CONFIG[card.category_primary]
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white"
        style={{ backgroundColor: config.color }}
      >
        {config.label}
        {card.category_secondary && ` · ${card.category_secondary}`}
      </span>
    )
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold">부가명함 관리</h1>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                대시보드로
              </button>
              <button
                onClick={() => {
                  setEditingCard(null)
                  setShowForm(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                새 부가명함 추가
              </button>
            </div>
          </div>

          {/* Category Filter */}
          {cards.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">카테고리 필터</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체 ({cards.length})
                </button>
                {(Object.keys(CATEGORY_CONFIG) as CategoryPrimary[]).map((key) => {
                  const config = CATEGORY_CONFIG[key]
                  const count = cards.filter(c => c.category_primary === key).length
                  if (count === 0) return null

                  return (
                    <button
                      key={key}
                      onClick={() => setCategoryFilter(key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        categoryFilter === key
                          ? 'text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={
                        categoryFilter === key
                          ? { backgroundColor: config.color }
                          : undefined
                      }
                    >
                      {config.label} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Card List */}
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">
                {categoryFilter === 'all'
                  ? '아직 부가명함이 없습니다.'
                  : '해당 카테고리의 부가명함이 없습니다.'}
              </p>
              {categoryFilter === 'all' && (
                <p className="text-sm">사이드 비즈니스를 추가해보세요!</p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCards.map((card, index) => (
                <div
                  key={card.id}
                  className={`border rounded-lg p-4 ${
                    card.is_active ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    {card.image_url && (
                      <div className="w-48 h-32 flex-shrink-0">
                        {card.cta_url ? (
                          <a
                            href={card.cta_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full h-full rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={card.image_url}
                              alt={card.title}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ) : (
                          <div className="w-full h-full rounded-lg overflow-hidden">
                            <img
                              src={card.image_url}
                              alt={card.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{card.title}</h3>
                        {!card.is_active && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            비활성
                          </span>
                        )}
                        {card.badge && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-medium">
                            {card.badge}
                          </span>
                        )}
                      </div>

                      {/* Category Badge */}
                      <div className="mb-2">{getCategoryBadge(card)}</div>

                      {card.description && (
                        <p className="text-gray-600 mb-2 text-sm">{card.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                        {card.price && <span>💰 {card.price}</span>}
                        {card.cta_text && <span>🔘 {card.cta_text}</span>}
                        <span>👁️ {card.view_count}</span>
                        <span>🖱️ {card.click_count}</span>
                        {card.expiry_date && (
                          <span className="text-orange-600 font-medium">
                            ⏰ {new Date(card.expiry_date).toLocaleDateString()}까지
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeOrder(card, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                        title="위로 이동"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => changeOrder(card, 'down')}
                        disabled={index === filteredCards.length - 1}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                        title="아래로 이동"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(card)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                        title={card.is_active ? '비활성화' : '활성화'}
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
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <SideJobCardForm
              editingCard={editingCard}
              businessCards={businessCards}
              onClose={() => {
                setShowForm(false)
                setEditingCard(null)
              }}
              onSuccess={() => {
                fetchSideJobCards()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
