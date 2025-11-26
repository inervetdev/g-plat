/**
 * 사용자 부가명함 편집 모달
 */

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Image as ImageIcon } from 'lucide-react'
import type { UserSidejobCard, UserSidejobUpdateInput, CategoryPrimary } from '@/types/userSidejob'
import { CATEGORY_CONFIG, CATEGORY_SECONDARY_OPTIONS } from '@/types/userSidejob'
import { useUpdateUserSidejob } from '@/hooks/useUserSidejobs'

interface UserSidejobEditModalProps {
  card: UserSidejobCard
  onClose: () => void
  onSuccess: () => void
}

export function UserSidejobEditModal({
  card,
  onClose,
  onSuccess,
}: UserSidejobEditModalProps) {
  const updateMutation = useUpdateUserSidejob()

  const [formData, setFormData] = useState<UserSidejobUpdateInput>({
    title: card.title,
    description: card.description,
    price: card.price,
    cta_text: card.cta_text,
    cta_link: card.cta_link,
    category_primary: card.category_primary,
    category_secondary: card.category_secondary,
    badge: card.badge,
    is_active: card.is_active,
    display_order: card.display_order,
  })

  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CategoryPrimary | ''
    setFormData((prev) => ({
      ...prev,
      category_primary: value || null,
      category_secondary: null, // 카테고리 변경 시 세부 카테고리 초기화
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title?.trim()) {
      setError('제목은 필수입니다.')
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: card.id,
        input: formData,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError('수정 중 오류가 발생했습니다.')
      console.error(err)
    }
  }

  // ESC 키로 닫기
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            부가명함 편집
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-4">
            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* 이미지 미리보기 */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <p>이미지는 사용자가 직접 수정해야 합니다.</p>
                <p className="text-xs mt-1">
                  현재 이미지: {card.image_url ? '있음' : '없음'}
                </p>
              </div>
            </div>

            {/* 제목 */}
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

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="부가명함 설명"
              />
            </div>

            {/* 가격 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가격
              </label>
              <input
                type="text"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 10,000원"
              />
            </div>

            {/* 카테고리 */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA 링크
                </label>
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

            {/* 배지 & 순서 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  배지
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  표시 순서
                </label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order || 0}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 활성 상태 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                활성화
              </label>
            </div>

            {/* 메타 정보 */}
            <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
              <p>생성일: {new Date(card.created_at).toLocaleString('ko-KR')}</p>
              <p>수정일: {new Date(card.updated_at).toLocaleString('ko-KR')}</p>
              <p>조회수: {card.view_count.toLocaleString()} / 클릭수: {card.click_count.toLocaleString()}</p>
            </div>
          </div>

          {/* 푸터 */}
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
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  저장
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
