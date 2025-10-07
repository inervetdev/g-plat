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
  cta_url: string | null
  business_card_id: string | null
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
  const [businessCards, setBusinessCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState<SideJobCard | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    price: '',
    cta_text: '',
    cta_url: '',
    business_card_ids: [] as string[],
    is_active: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    try {
      setUploading(true)
      console.log('📤 Starting image upload...')
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type)
      console.log('User ID:', userId)

      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const filePath = `sidejob-images/${fileName}`

      console.log('Upload path:', filePath)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sidejob-cards')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        console.error('Error details:', JSON.stringify(uploadError, null, 2))
        alert(`이미지 업로드 실패: ${uploadError.message}`)
        throw uploadError
      }

      console.log('✅ Upload successful:', uploadData)

      const { data } = supabase.storage
        .from('sidejob-cards')
        .getPublicUrl(filePath)

      console.log('📍 Public URL:', data.publicUrl)
      return data.publicUrl
    } catch (error) {
      console.error('💥 Error uploading image:', error)
      alert(`이미지 업로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      return null
    } finally {
      setUploading(false)
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

      // Upload image if selected
      let imageUrl = formData.image_url
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, user.id)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      // 선택된 명함이 없으면 business_card_id를 null로 (모든 명함에 표시)
      const selectedCardIds = formData.business_card_ids.length > 0
        ? formData.business_card_ids
        : [null]

      if (editingCard) {
        // 수정 시: 기존 카드 업데이트
        const cardData = {
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          image_url: imageUrl || null,
          price: formData.price || null,
          cta_text: formData.cta_text || null,
          cta_url: formData.cta_url || null,
          is_active: formData.is_active,
          business_card_id: selectedCardIds[0] // 첫 번째 선택된 명함 사용
        }

        const result = await supabase
          .from('sidejob_cards')
          .update(cardData)
          .eq('id', editingCard.id)
          .select()

        if (result.error) {
          console.error('Error updating card:', result.error)
          alert(`수정 중 오류가 발생했습니다: ${result.error.message}`)
          return
        }
      } else {
        // 새로 생성 시: 선택된 각 명함에 대해 부가명함 생성
        const cardsToInsert = selectedCardIds.map(cardId => ({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          image_url: imageUrl || null,
          price: formData.price || null,
          cta_text: formData.cta_text || null,
          cta_url: formData.cta_url || null,
          is_active: formData.is_active,
          business_card_id: cardId,
          display_order: cards.length
        }))

        const result = await supabase
          .from('sidejob_cards')
          .insert(cardsToInsert)
          .select()

        if (result.error) {
          console.error('Error creating cards:', result.error)
          alert(`생성 중 오류가 발생했습니다: ${result.error.message}`)
          return
        }
      }

      alert(editingCard ? '수정되었습니다!' : '생성되었습니다!')
      setShowForm(false)
      setEditingCard(null)
      setFormData({
        title: '',
        description: '',
        image_url: '',
        price: '',
        cta_text: '',
        cta_url: '',
        business_card_ids: [],
        is_active: true
      })
      setImageFile(null)
      setImagePreview(null)
      fetchSideJobCards()
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
      image_url: card.image_url || '',
      price: card.price || '',
      cta_text: card.cta_text || '',
      cta_url: card.cta_url || '',
      business_card_ids: card.business_card_id ? [card.business_card_id] : [],
      is_active: card.is_active
    })
    setImagePreview(card.image_url)
    setImageFile(null)
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
                    image_url: '',
                    price: '',
                    cta_text: '',
                    cta_url: '',
                    business_card_ids: [],
                    is_active: true
                  })
                  setImageFile(null)
                  setImagePreview(null)
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
                  <div className="flex gap-4">
                    {/* Image with CTA Link */}
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
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
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

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      이미지
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {uploading && (
                      <p className="text-sm text-gray-500 mt-1">이미지 업로드 중...</p>
                    )}
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

                  {/* 명함 선택 */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      연결할 명함 선택
                    </label>
                    {businessCards.length === 0 ? (
                      <p className="text-sm text-gray-500">등록된 명함이 없습니다.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.business_card_ids.length === 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, business_card_ids: [] })
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">모든 명함에 표시</span>
                        </label>
                        {businessCards.map((card) => (
                          <label key={card.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.business_card_ids.includes(card.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    business_card_ids: [...formData.business_card_ids, card.id]
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    business_card_ids: formData.business_card_ids.filter(id => id !== card.id)
                                  })
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{card.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      💡 선택하지 않으면 모든 명함에 표시됩니다. 여러 명함을 선택하면 각 명함마다 복사됩니다.
                    </p>
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