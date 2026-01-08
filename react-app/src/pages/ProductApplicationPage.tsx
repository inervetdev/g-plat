// Product Application Page
// 상품 신청 페이지

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DynamicFormField, validateField } from '../components/application/DynamicFormField'
import {
  fetchTemplateForApplication,
  submitApplication,
  checkDuplicateApplication,
} from '../lib/applications'
import type { ApplicationTemplate, FormFieldSchema } from '../types/application'

interface FormData {
  applicant_name: string
  applicant_phone: string
  applicant_email: string
  privacy_agreed: boolean
  [key: string]: string | number | boolean
}

interface FormErrors {
  [key: string]: string | null
}

export default function ProductApplicationPage() {
  const { templateId, referrerUrl } = useParams<{ templateId: string; referrerUrl?: string }>()
  const navigate = useNavigate()

  const [template, setTemplate] = useState<ApplicationTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    applicant_name: '',
    applicant_phone: '',
    applicant_email: '',
    privacy_agreed: false,
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Load template
  useEffect(() => {
    async function loadTemplate() {
      if (!templateId) {
        setError('잘못된 접근입니다.')
        setLoading(false)
        return
      }

      try {
        const data = await fetchTemplateForApplication(templateId)
        if (!data) {
          setError('상품을 찾을 수 없거나 신청이 불가능한 상품입니다.')
        } else {
          setTemplate(data)
          // Initialize dynamic form fields with default values
          const initialFormData: FormData = {
            applicant_name: '',
            applicant_phone: '',
            applicant_email: '',
            privacy_agreed: false,
          }
          data.form_schema.forEach((field) => {
            if (field.defaultValue !== undefined) {
              initialFormData[field.name] = field.defaultValue
            } else {
              initialFormData[field.name] = field.type === 'checkbox' ? false : ''
            }
          })
          setFormData(initialFormData)
        }
      } catch (err) {
        setError('상품 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }
    loadTemplate()
  }, [templateId])

  // Handle form field change
  const handleFieldChange = useCallback((name: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is changed
    setFormErrors((prev) => ({ ...prev, [name]: null }))
  }, [])

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    const errors: FormErrors = {}
    let isValid = true

    // Validate basic fields
    if (!formData.applicant_name.trim()) {
      errors.applicant_name = '이름을 입력해주세요.'
      isValid = false
    }

    if (!formData.applicant_phone.trim()) {
      errors.applicant_phone = '연락처를 입력해주세요.'
      isValid = false
    } else {
      const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/
      if (!phoneRegex.test(formData.applicant_phone.replace(/-/g, ''))) {
        errors.applicant_phone = '올바른 휴대폰 번호를 입력해주세요.'
        isValid = false
      }
    }

    if (!formData.applicant_email.trim()) {
      errors.applicant_email = '이메일을 입력해주세요.'
      isValid = false
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.applicant_email)) {
        errors.applicant_email = '올바른 이메일 형식을 입력해주세요.'
        isValid = false
      }
    }

    if (!formData.privacy_agreed) {
      errors.privacy_agreed = '개인정보 수집 및 이용에 동의해주세요.'
      isValid = false
    }

    // Validate dynamic fields
    if (template?.form_schema) {
      template.form_schema.forEach((field) => {
        const fieldError = validateField(field, formData[field.name])
        if (fieldError) {
          errors[field.name] = fieldError
          isValid = false
        }
      })
    }

    setFormErrors(errors)
    return isValid
  }, [formData, template])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateAllFields()) {
      return
    }

    if (!template || !templateId) {
      setError('상품 정보가 없습니다.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Check for duplicate
      if (template.application_settings.duplicate_check) {
        const isDuplicate = await checkDuplicateApplication(
          templateId,
          formData.applicant_email,
          template.application_settings.duplicate_period_days || 30
        )
        if (isDuplicate) {
          setError('이미 동일한 이메일로 신청한 이력이 있습니다.')
          setSubmitting(false)
          return
        }
      }

      // Build form_data for dynamic fields
      const dynamicFormData: Record<string, unknown> = {}
      template.form_schema.forEach((field) => {
        dynamicFormData[field.name] = formData[field.name]
      })

      const result = await submitApplication({
        template_id: templateId,
        referrer_card_url: referrerUrl,
        applicant_name: formData.applicant_name,
        applicant_phone: formData.applicant_phone,
        applicant_email: formData.applicant_email,
        form_data: dynamicFormData,
        privacy_agreed: formData.privacy_agreed,
      })

      if (result.id) {
        setSubmitted(true)
      } else {
        setError(result.message || '신청 중 오류가 발생했습니다.')
      }
    } catch (err) {
      setError('신청 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">오류</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">신청 완료!</h1>
          <p className="text-gray-600 mb-6">
            신청이 정상적으로 접수되었습니다.<br />
            담당자가 확인 후 연락드리겠습니다.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로
          </button>
        </div>
      </div>
    )
  }

  if (!template) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header - Product Info */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {template.image_url && (
            <img
              src={template.image_url}
              alt={template.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              {template.partner_name && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  {template.partner_name}
                </span>
              )}
              {template.price && (
                <span className="text-blue-600 font-bold">{template.price}</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">{template.title}</h1>
            {template.description && (
              <p className="text-gray-600 text-sm">{template.description}</p>
            )}
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">신청 정보 입력</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Info Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">기본 정보</h3>

            {/* Name */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.applicant_name}
                onChange={(e) => handleFieldChange('applicant_name', e.target.value)}
                placeholder="홍길동"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.applicant_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.applicant_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.applicant_name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.applicant_phone}
                onChange={(e) => handleFieldChange('applicant_phone', e.target.value)}
                placeholder="010-1234-5678"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.applicant_phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.applicant_phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.applicant_phone}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.applicant_email}
                onChange={(e) => handleFieldChange('applicant_email', e.target.value)}
                placeholder="example@email.com"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.applicant_email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.applicant_email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.applicant_email}</p>
              )}
            </div>
          </div>

          {/* Dynamic Fields Section */}
          {template.form_schema.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">추가 정보</h3>
              {template.form_schema.map((field: FormFieldSchema) => (
                <DynamicFormField
                  key={field.name}
                  field={field}
                  value={formData[field.name]}
                  onChange={handleFieldChange}
                  error={formErrors[field.name] || undefined}
                />
              ))}
            </div>
          )}

          {/* Privacy Agreement */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacy_agreed}
                onChange={(e) => handleFieldChange('privacy_agreed', e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <span className="font-medium">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
                <br />
                <span className="text-gray-500 text-xs">
                  수집항목: 이름, 연락처, 이메일 / 이용목적: 상품 신청 처리 및 상담
                </span>
              </span>
            </label>
            {formErrors.privacy_agreed && (
              <p className="mt-2 text-sm text-red-600">{formErrors.privacy_agreed}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 rounded-xl font-bold text-white transition-colors ${
              submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                신청 중...
              </span>
            ) : (
              '신청하기'
            )}
          </button>

          {/* Referrer Info */}
          {referrerUrl && (
            <p className="mt-4 text-center text-xs text-gray-400">
              추천인: {referrerUrl}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
