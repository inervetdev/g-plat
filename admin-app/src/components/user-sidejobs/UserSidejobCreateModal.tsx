/**
 * 사용자 부가명함 생성 모달 (관리자용)
 */

import { useState, useEffect, useRef } from 'react'
import { X, Save, Loader2, Image as ImageIcon, Upload, Search, Plus } from 'lucide-react'
import type { CategoryPrimary } from '@/types/userSidejob'
import { CATEGORY_CONFIG, CATEGORY_SECONDARY_OPTIONS } from '@/types/userSidejob'
import {
  createUserSidejob,
  uploadSidejobImage,
  searchUsersForSidejob,
  fetchBusinessCardsForUser,
} from '@/lib/api/userSidejobs'
import type { CreateUserSidejobInput } from '@/lib/api/userSidejobs'

interface UserSidejobCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface UserOption {
  id: string
  name: string
  email?: string
}

interface BusinessCardOption {
  id: string
  name: string
  custom_url: string | null
}

export function UserSidejobCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: UserSidejobCreateModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<CreateUserSidejobInput>>({
    title: '',
    description: '',
    price: '',
    cta_text: '',
    cta_link: '',
    category_primary: undefined,
    category_secondary: '',
    badge: '',
    is_active: true,
    display_order: 0,
  })

  // User search state
  const [userSearch, setUserSearch] = useState('')
  const [users, setUsers] = useState<UserOption[]>([])
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [searchingUsers, setSearchingUsers] = useState(false)

  // Business card state
  const [businessCards, setBusinessCards] = useState<BusinessCardOption[]>([])
  const [selectedBusinessCard, setSelectedBusinessCard] = useState<BusinessCardOption | null>(null)
  const [loadingCards, setLoadingCards] = useState(false)

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Error state
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Search users when input changes
  useEffect(() => {
    const search = async () => {
      if (userSearch.length < 2) {
        setUsers([])
        return
      }

      setSearchingUsers(true)
      try {
        const results = await searchUsersForSidejob(userSearch)
        setUsers(results)
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setSearchingUsers(false)
      }
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [userSearch])

  // Fetch business cards when user is selected
  useEffect(() => {
    const fetchCards = async () => {
      if (!selectedUser) {
        setBusinessCards([])
        return
      }

      setLoadingCards(true)
      try {
        const cards = await fetchBusinessCardsForUser(selectedUser.id)
        setBusinessCards(cards)
        // Auto-select first card if available
        if (cards.length > 0) {
          setSelectedBusinessCard(cards[0])
        }
      } catch (error) {
        console.error('Error fetching business cards:', error)
      } finally {
        setLoadingCards(false)
      }
    }

    fetchCards()
  }, [selectedUser])

  // Handle user selection
  const handleUserSelect = (user: UserOption) => {
    setSelectedUser(user)
    setUserSearch(user.name)
    setShowUserDropdown(false)
    setSelectedBusinessCard(null)
  }

  // Handle form change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CategoryPrimary | ''
    setFormData((prev) => ({
      ...prev,
      category_primary: value || undefined,
      category_secondary: '',
    }))
  }

  // Handle file select
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('JPG, PNG, WebP, GIF 형식만 지원합니다.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.')
      return
    }

    setError(null)
    setImageFile(file)

    // Preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Cleanup
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Clear image
  const handleClearImage = () => {
    setImageFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!selectedUser) {
      setError('사용자를 선택하세요.')
      return
    }

    if (!formData.title?.trim()) {
      setError('제목은 필수입니다.')
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl: string | undefined

      // Upload image if selected
      if (imageFile && selectedUser) {
        setIsUploading(true)
        // Create a temporary ID for the new sidejob
        const tempId = `new_${Date.now()}`
        imageUrl = await uploadSidejobImage(tempId, selectedUser.id, imageFile)
        setIsUploading(false)
      }

      // Create sidejob
      const input: CreateUserSidejobInput = {
        user_id: selectedUser.id,
        business_card_id: selectedBusinessCard?.id,
        title: formData.title!,
        description: formData.description || undefined,
        image_url: imageUrl,
        price: formData.price || undefined,
        cta_text: formData.cta_text || undefined,
        cta_link: formData.cta_link || undefined,
        category_primary: formData.category_primary,
        category_secondary: formData.category_secondary || undefined,
        badge: formData.badge || undefined,
        is_active: formData.is_active ?? true,
        display_order: formData.display_order ?? 0,
      }

      await createUserSidejob(input)

      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        cta_text: '',
        cta_link: '',
        category_primary: undefined,
        category_secondary: '',
        badge: '',
        is_active: true,
        display_order: 0,
      })
      setSelectedUser(null)
      setUserSearch('')
      setSelectedBusinessCard(null)
      handleClearImage()

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error creating sidejob:', err)
      setError(`부가명함 생성 실패: ${err.message || '알 수 없는 오류'}`)
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const secondaryOptions = formData.category_primary
    ? CATEGORY_SECONDARY_OPTIONS[formData.category_primary]
    : []

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            새 부가명함 생성
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-4">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
            )}

            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자 선택 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value)
                    setShowUserDropdown(true)
                    if (!e.target.value) {
                      setSelectedUser(null)
                    }
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  placeholder="사용자 이름으로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchingUsers && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>

              {/* User Dropdown */}
              {showUserDropdown && users.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex flex-col"
                    >
                      <span className="font-medium text-gray-900">{user.name}</span>
                      <span className="text-sm text-gray-500">{user.id.slice(0, 8)}...</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                  선택된 사용자: {selectedUser.name}
                </div>
              )}
            </div>

            {/* Business Card Selection */}
            {selectedUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연결할 명함 (선택)
                </label>
                {loadingCards ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    명함 목록 불러오는 중...
                  </div>
                ) : businessCards.length > 0 ? (
                  <select
                    value={selectedBusinessCard?.id || ''}
                    onChange={(e) => {
                      const card = businessCards.find((c) => c.id === e.target.value)
                      setSelectedBusinessCard(card || null)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">선택 안 함</option>
                    {businessCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name} {card.custom_url && `(${card.custom_url})`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-500">
                    이 사용자의 명함이 없습니다. 명함 없이 부가명함만 생성됩니다.
                  </p>
                )}
              </div>
            )}

            {/* Image Upload */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                이미지
              </label>
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 relative">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload buttons */}
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-gray-600">
                    부가명함에 표시할 이미지를 업로드하세요.
                  </p>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {previewUrl ? '이미지 변경' : '이미지 업로드'}
                    </button>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG, WebP, GIF / 최대 5MB</p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="부가명함 제목"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="부가명함 설명"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
              <input
                type="text"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 10,000원"
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주요 카테고리
                </label>
                <select
                  name="category_primary"
                  value={formData.category_primary || ''}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">선택 안 함</option>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.emoji} {config.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  세부 카테고리
                </label>
                <select
                  name="category_secondary"
                  value={formData.category_secondary || ''}
                  onChange={handleChange}
                  disabled={!formData.category_primary}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">선택 안 함</option>
                  {secondaryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA 버튼 텍스트
                </label>
                <input
                  type="text"
                  name="cta_text"
                  value={formData.cta_text || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 자세히 보기"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA 링크</label>
                <input
                  type="url"
                  name="cta_link"
                  value={formData.cta_link || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Badge & Order */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">배지</label>
                <input
                  type="text"
                  name="badge"
                  value={formData.badge || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: HOT, NEW, SALE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">표시 순서</label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order || 0}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Active state */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_create"
                name="is_active"
                checked={formData.is_active ?? true}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active_create" className="text-sm font-medium text-gray-700">
                활성화
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading || !selectedUser}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  생성
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
