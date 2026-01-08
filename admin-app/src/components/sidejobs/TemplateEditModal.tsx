// Template Edit Modal Component
// 템플릿 수정 모달 컴포넌트

import { useState, useEffect, useRef } from 'react'
import { X, Upload, Loader2, Trash2 } from 'lucide-react'
import { useUpdateTemplate, useDeleteTemplate } from '@/hooks/useSidejobs'
import { CATEGORY_LABELS } from '@/types/sidejob'
import { supabase } from '@/lib/supabase'
import type { AdminSidejobTemplate, AdminSidejobTemplateInput, AdminB2BCategory } from '@/types/sidejob'
import type { FormFieldSchema, RewardType } from '@/types/application'
import { FormSchemaEditor } from './FormSchemaEditor'

interface TemplateEditModalProps {
  template: AdminSidejobTemplate
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const BADGE_OPTIONS = ['', 'HOT', 'NEW', '추천', '인기', '한정']

export function TemplateEditModal({ template, isOpen, onClose, onSuccess }: TemplateEditModalProps) {
  const updateMutation = useUpdateTemplate()
  const deleteMutation = useDeleteTemplate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState<AdminSidejobTemplateInput>({
    title: template.title,
    description: template.description,
    image_url: template.image_url,
    price: template.price,
    category: template.category,
    cta_text: template.cta_text,
    base_cta_link: template.base_cta_link,
    partner_name: template.partner_name,
    partner_id: template.partner_id,
    commission_rate: template.commission_rate,
    badge: template.badge,
    display_priority: template.display_priority,
    is_active: template.is_active,
    // Application fields
    application_enabled: template.application_enabled ?? false,
    form_schema: template.form_schema ?? [],
    application_settings: template.application_settings ?? {
      reward_type: 'none',
      reward_amount: 0,
      duplicate_check: true,
      duplicate_period_days: 30,
    },
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Update form when template changes
  useEffect(() => {
    setFormData({
      title: template.title,
      description: template.description,
      image_url: template.image_url,
      price: template.price,
      category: template.category,
      cta_text: template.cta_text,
      base_cta_link: template.base_cta_link,
      partner_name: template.partner_name,
      partner_id: template.partner_id,
      commission_rate: template.commission_rate,
      badge: template.badge,
      display_priority: template.display_priority,
      is_active: template.is_active,
      // Application fields
      application_enabled: template.application_enabled ?? false,
      form_schema: template.form_schema ?? [],
      application_settings: template.application_settings ?? {
        reward_type: 'none',
        reward_amount: 0,
        duplicate_check: true,
        duplicate_period_days: 30,
      },
    })
  }, [template])

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

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다')
      return
    }

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
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await updateMutation.mutateAsync({
        templateId: template.id,
        input: formData,
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to update template:', error)
      alert('템플릿 수정에 실패했습니다')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        templateId: template.id,
        permanent: false, // Soft delete
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to delete template:', error)
      alert('템플릿 삭제에 실패했습니다')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">템플릿 수정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Stats Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500">할당:</span>
              <span className="ml-1 font-medium text-gray-900">{template.total_instances}</span>
            </div>
            <div>
              <span className="text-gray-500">클릭:</span>
              <span className="ml-1 font-medium text-gray-900">{template.total_clicks.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">전환:</span>
              <span className="ml-1 font-medium text-gray-900">{template.total_conversions.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">생성일:</span>
              <span className="ml-1 font-medium text-gray-900">
                {new Date(template.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Partner Info Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">파트너 정보</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">파트너사명</label>
                <input
                  type="text"
                  value={formData.partner_name || ''}
                  onChange={(e) => handleChange('partner_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">파트너 ID</label>
                <input
                  type="text"
                  value={formData.partner_id || ''}
                  onChange={(e) => handleChange('partner_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

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
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">CTA 설정</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                기본 URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.base_cta_link}
                onChange={(e) => handleChange('base_cta_link', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.base_cta_link ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.base_cta_link && (
                <p className="text-red-500 text-sm mt-1">{errors.base_cta_link}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">버튼 텍스트</label>
              <input
                type="text"
                value={formData.cta_text || ''}
                onChange={(e) => handleChange('cta_text', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Display Settings Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">표시 설정</h3>

            <div className="grid grid-cols-3 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                <input
                  type="number"
                  value={formData.display_priority || 0}
                  onChange={(e) => handleChange('display_priority', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                저장
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirm Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">템플릿 삭제</h3>
              <p className="text-gray-600 mb-4">
                이 템플릿을 삭제하시겠습니까? 삭제된 템플릿은 비활성 상태로 변경됩니다.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
