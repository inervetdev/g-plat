// Template Create Modal Component
// 템플릿 생성 모달 컴포넌트

import { useState, useRef } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { useCreateTemplate } from '@/hooks/useSidejobs'
import { CATEGORY_LABELS } from '@/types/sidejob'
import { supabase } from '@/lib/supabase'
import type { AdminSidejobTemplateInput, AdminB2BCategory } from '@/types/sidejob'
import type { FormFieldSchema, RewardType } from '@/types/application'
import { FormSchemaEditor } from './FormSchemaEditor'

interface TemplateCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const BADGE_OPTIONS = ['', 'HOT', 'NEW', '추천', '인기', '한정']

export function TemplateCreateModal({ isOpen, onClose, onSuccess }: TemplateCreateModalProps) {
  const createMutation = useCreateTemplate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState<AdminSidejobTemplateInput>({
    title: '',
    description: '',
    image_url: '',
    price: '',
    category: 'rental',
    cta_text: '자세히 보기',
    base_cta_link: '',
    partner_name: '',
    partner_id: '',
    commission_rate: 0,
    badge: '',
    display_priority: 0,
    is_active: true,
    // Application fields
    application_enabled: false,
    form_schema: [],
    application_settings: {
      reward_type: 'none',
      reward_amount: 0,
      duplicate_check: true,
      duplicate_period_days: 30,
    },
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof AdminSidejobTemplateInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '템플릿명을 입력해주세요'
    }

    if (!formData.base_cta_link.trim()) {
      newErrors.base_cta_link = '기본 URL을 입력해주세요'
    } else if (!isValidUrl(formData.base_cta_link)) {
      newErrors.base_cta_link = '올바른 URL 형식이 아닙니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다')
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `sidejob-templates/${Date.now()}.${fileExt}`
      const bucket = 'card-attachments'

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('이미지 업로드에 실패했습니다')
        return
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
      handleChange('image_url', urlData.publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('이미지 업로드에 실패했습니다')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await createMutation.mutateAsync(formData)
      onSuccess()
      // Reset form
      setFormData({
        title: '',
        description: '',
        image_url: '',
        price: '',
        category: 'rental',
        cta_text: '자세히 보기',
        base_cta_link: '',
        partner_name: '',
        partner_id: '',
        commission_rate: 0,
        badge: '',
        display_priority: 0,
        is_active: true,
        application_enabled: false,
        form_schema: [],
        application_settings: {
          reward_type: 'none',
          reward_amount: 0,
          duplicate_check: true,
          duplicate_period_days: 30,
        },
      })
    } catch (error) {
      console.error('Failed to create template:', error)
      alert('템플릿 생성에 실패했습니다')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">새 템플릿 추가</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                템플릿명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="예: KB 카드단말기"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value as AdminB2BCategory)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="템플릿 설명을 입력하세요"
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image_url || ''}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isUploading ? '업로드 중...' : '업로드'}
                </button>
              </div>
              {formData.image_url && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격 표시</label>
              <input
                type="text"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="예: 월 29,000원, 무료"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Partner Info Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">파트너 정보</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Partner Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">파트너사명</label>
                <input
                  type="text"
                  value={formData.partner_name || ''}
                  onChange={(e) => handleChange('partner_name', e.target.value)}
                  placeholder="예: KB국민은행"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Partner ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">파트너 ID</label>
                <input
                  type="text"
                  value={formData.partner_id || ''}
                  onChange={(e) => handleChange('partner_id', e.target.value)}
                  placeholder="내부 관리용 ID"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                건당 수수료 (예상 수익 계산용)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.commission_rate || 0}
                  onChange={(e) => handleChange('commission_rate', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1000"
                  className="w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-600">원</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                전환 1건당 예상 수수료 금액 (실제 정산은 파트너사 확인 후 수동 입력)
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">CTA 설정</h3>

            {/* Base CTA Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                기본 URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.base_cta_link}
                onChange={(e) => handleChange('base_cta_link', e.target.value)}
                placeholder="https://partner.com/affiliate?ref=gplat"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.base_cta_link ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.base_cta_link && (
                <p className="text-red-500 text-sm mt-1">{errors.base_cta_link}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                무료 회원에게 표시되는 공통 URL (회사 수수료)
              </p>
            </div>

            {/* CTA Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">버튼 텍스트</label>
              <input
                type="text"
                value={formData.cta_text || '자세히 보기'}
                onChange={(e) => handleChange('cta_text', e.target.value)}
                placeholder="자세히 보기"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Display Settings Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">표시 설정</h3>

            <div className="grid grid-cols-3 gap-4">
              {/* Badge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">배지</label>
                <select
                  value={formData.badge || ''}
                  onChange={(e) => handleChange('badge', e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BADGE_OPTIONS.map((badge) => (
                    <option key={badge} value={badge}>
                      {badge || '없음'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                <input
                  type="number"
                  value={formData.display_priority || 0}
                  onChange={(e) => handleChange('display_priority', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">높을수록 먼저 표시</p>
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">활성화</span>
                </label>
              </div>
            </div>
          </div>

          {/* Application Settings Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">신청 폼 설정</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.application_enabled}
                  onChange={(e) => handleChange('application_enabled', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">신청 기능 활성화</span>
              </label>
            </div>

            {formData.application_enabled && (
              <>
                {/* Reward Settings */}
                <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-yellow-900">추천인 보상 설정</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-yellow-700 mb-1">
                        보상 유형
                      </label>
                      <select
                        value={formData.application_settings?.reward_type || 'none'}
                        onChange={(e) =>
                          handleChange('application_settings', {
                            ...formData.application_settings,
                            reward_type: e.target.value as RewardType,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-lg"
                      >
                        <option value="none">없음</option>
                        <option value="commission">수수료</option>
                        <option value="points">포인트</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-yellow-700 mb-1">
                        보상 금액
                      </label>
                      <input
                        type="number"
                        value={formData.application_settings?.reward_amount || 0}
                        onChange={(e) =>
                          handleChange('application_settings', {
                            ...formData.application_settings,
                            reward_amount: Number(e.target.value),
                          })
                        }
                        min="0"
                        className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Duplicate Check */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.application_settings?.duplicate_check ?? true}
                      onChange={(e) =>
                        handleChange('application_settings', {
                          ...formData.application_settings,
                          duplicate_check: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">중복 신청 체크</span>
                  </label>
                  {formData.application_settings?.duplicate_check && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.application_settings?.duplicate_period_days || 30}
                        onChange={(e) =>
                          handleChange('application_settings', {
                            ...formData.application_settings,
                            duplicate_period_days: Number(e.target.value),
                          })
                        }
                        min="1"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg"
                      />
                      <span className="text-sm text-gray-500">일 이내</span>
                    </div>
                  )}
                </div>

                {/* Form Schema Editor */}
                <FormSchemaEditor
                  schema={formData.form_schema || []}
                  onChange={(schema: FormFieldSchema[]) => handleChange('form_schema', schema)}
                />
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              템플릿 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
