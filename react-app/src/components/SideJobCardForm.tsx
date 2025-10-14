import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import CategorySelector from './CategorySelector'
import type { CategoryPrimary } from '../types/sidejob'
import { X } from 'lucide-react'

interface SideJobCardFormProps {
  editingCard?: any
  businessCards: any[]
  onClose: () => void
  onSuccess: () => void
}

export default function SideJobCardForm({
  editingCard,
  businessCards,
  onClose,
  onSuccess
}: SideJobCardFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    price: '',
    cta_text: '',
    cta_link: '',
    business_card_ids: [] as string[],
    category_primary: null as CategoryPrimary | null,
    category_secondary: null as string | null,
    badge: '',
    expiry_date: '',
    is_active: true
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editingCard) {
      setFormData({
        title: editingCard.title,
        description: editingCard.description || '',
        image_url: editingCard.image_url || '',
        price: editingCard.price || '',
        cta_text: editingCard.cta_text || '',
        cta_link: editingCard.cta_link || '',
        business_card_ids: editingCard.business_card_id ? [editingCard.business_card_id] : [],
        category_primary: editingCard.category_primary || null,
        category_secondary: editingCard.category_secondary || null,
        badge: editingCard.badge || '',
        expiry_date: editingCard.expiry_date ? editingCard.expiry_date.split('T')[0] : '',
        is_active: editingCard.is_active
      })
      setImagePreview(editingCard.image_url)
      setImageFile(null)
    }
  }, [editingCard])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }

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

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      console.log('Upload path:', filePath)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sidejob-cards')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
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

    // Debug logging
    console.log('🔍 Form submission - formData:', formData)

    // Validation
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (!formData.category_primary || !formData.category_secondary) {
      console.error('❌ Category validation failed:', {
        category_primary: formData.category_primary,
        category_secondary: formData.category_secondary
      })
      alert('카테고리를 선택해주세요.')
      return
    }

    if (!formData.cta_link.trim()) {
      alert('CTA 링크 URL을 입력해주세요.')
      return
    }

    // Simple URL validation
    const urlPattern = /^https?:\/\/.+/i
    if (!urlPattern.test(formData.cta_link.trim())) {
      alert('유효한 URL을 입력해주세요. (http:// 또는 https://로 시작해야 합니다)')
      return
    }

    try {
      setSubmitting(true)
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
        } else {
          return // Upload failed
        }
      }

      // Prepare card data
      const selectedCardIds = formData.business_card_ids.length > 0
        ? formData.business_card_ids
        : [null]

      const cardDataBase = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        image_url: imageUrl || null,
        price: formData.price.trim() || null,
        cta_text: formData.cta_text.trim() || null,
        cta_link: formData.cta_link.trim() || null,
        category_primary: formData.category_primary,
        category_secondary: formData.category_secondary,
        badge: formData.badge.trim() || null,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
        is_active: formData.is_active
      }

      if (editingCard) {
        // Update existing card
        const { error } = await supabase
          .from('sidejob_cards')
          .update({
            ...cardDataBase,
            business_card_id: selectedCardIds[0]
          })
          .eq('id', editingCard.id)

        if (error) {
          console.error('Error updating card:', error)
          alert(`수정 중 오류가 발생했습니다: ${error.message}`)
          return
        }

        alert('수정되었습니다!')
      } else {
        // Create new cards
        const cardsToInsert = selectedCardIds.map((cardId, index) => ({
          ...cardDataBase,
          business_card_id: cardId,
          display_order: index
        }))

        const { error } = await supabase
          .from('sidejob_cards')
          .insert(cardsToInsert)

        if (error) {
          console.error('Error creating cards:', error)
          alert(`생성 중 오류가 발생했습니다: ${error.message}`)
          return
        }

        alert('생성되었습니다!')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('예상치 못한 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCTASuggestion = (ctaText: string) => {
    setFormData(prev => {
      if (!prev.cta_text) {
        return { ...prev, cta_text: ctaText }
      }
      return prev
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {editingCard ? '부가명함 수정' : '새 부가명함 추가'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <CategorySelector
            selectedPrimary={formData.category_primary}
            selectedSecondary={formData.category_secondary}
            onCategoryChange={(primary, secondary) => {
              console.log('📝 Category changed:', { primary, secondary })
              setFormData(prev => ({
                ...prev,
                category_primary: primary,
                category_secondary: secondary
              }))
            }}
            onCTASuggestion={handleCTASuggestion}
          />

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 건강한 다이어트 도시락"
              maxLength={50}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/50자
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="부업 카드에 대한 간단한 설명을 입력하세요"
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/200자
            </p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                    setFormData({ ...formData, image_url: '' })
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {uploading && (
              <p className="text-sm text-blue-600 mt-2">이미지 업로드 중...</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              최대 5MB, JPG/PNG 형식
            </p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              가격 표시
            </label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="예: 월 9,900원 / 무료 / 가격협의"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Badge */}
          <div>
            <label className="block text-sm font-medium mb-1">
              배지 (선택)
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              placeholder="예: HOT / NEW / 30% 할인"
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              카드 상단에 강조 배지로 표시됩니다
            </p>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              유효기간 (선택)
            </label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              기간 한정 프로모션인 경우 설정하세요
            </p>
          </div>

          {/* CTA Button */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                CTA 버튼 텍스트
              </label>
              <input
                type="text"
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                placeholder="예: 상품 보러가기"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                CTA 링크 URL *
              </label>
              <input
                type="text"
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                placeholder="https://example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                전체 URL을 입력하세요 (예: https://naver.com)
              </p>
            </div>
          </div>

          {/* Business Card Selection */}
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
                  <span className="text-sm font-medium">모든 명함에 표시</span>
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
              💡 선택하지 않으면 모든 명함에 표시됩니다
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              활성화 (명함에 표시)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '처리 중...' : editingCard ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
