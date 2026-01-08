// Dynamic Form Field Component
// 동적 폼 필드 컴포넌트 - form_schema 기반 렌더링

import { useState } from 'react'
import type { FormFieldSchema } from '../../types/application'

interface DynamicFormFieldProps {
  field: FormFieldSchema
  value: string | number | boolean
  onChange: (name: string, value: string | number | boolean) => void
  error?: string
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const [touched, setTouched] = useState(false)

  const handleChange = (newValue: string | number | boolean) => {
    onChange(field.name, newValue)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  const showError = touched && error

  const baseInputClass = `
    w-full px-4 py-3 border rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500
    transition-colors
    ${showError ? 'border-red-500 bg-red-50' : 'border-gray-300'}
  `

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            type={field.type === 'phone' ? 'tel' : field.type}
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            className={baseInputClass}
            required={field.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => handleChange(Number(e.target.value))}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            className={baseInputClass}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            className={`${baseInputClass} min-h-[100px] resize-y`}
            required={field.required}
            maxLength={field.validation?.maxLength}
          />
        )

      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={baseInputClass}
            required={field.required}
          >
            <option value="">{field.placeholder || '선택하세요'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handleChange(e.target.checked)}
              onBlur={handleBlur}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required={field.required}
            />
            <span className="text-gray-700">{field.label}</span>
          </label>
        )

      case 'date':
        return (
          <input
            type="date"
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={baseInputClass}
            required={field.required}
          />
        )

      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            className={baseInputClass}
            required={field.required}
          />
        )
    }
  }

  // Checkbox는 라벨을 내부에 포함
  if (field.type === 'checkbox') {
    return (
      <div className="mb-4">
        {renderField()}
        {showError && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {field.helpText && !showError && (
          <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
        )}
      </div>
    )
  }

  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {showError && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {field.helpText && !showError && (
        <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
      )}
    </div>
  )
}

// Validation helper
export function validateField(
  field: FormFieldSchema,
  value: string | number | boolean
): string | null {
  // Required check
  if (field.required) {
    if (value === '' || value === undefined || value === null) {
      return `${field.label}은(는) 필수 항목입니다.`
    }
    if (field.type === 'checkbox' && value === false) {
      return `${field.label}에 동의해주세요.`
    }
  }

  // Skip validation for empty optional fields
  if (!value && !field.required) {
    return null
  }

  const stringValue = String(value)

  // Pattern validation
  if (field.validation?.pattern && typeof value === 'string') {
    const regex = new RegExp(field.validation.pattern)
    if (!regex.test(value)) {
      return field.validation.message || '올바른 형식이 아닙니다.'
    }
  }

  // Length validation for strings
  if (typeof value === 'string') {
    if (field.validation?.minLength && stringValue.length < field.validation.minLength) {
      return `최소 ${field.validation.minLength}자 이상 입력해주세요.`
    }
    if (field.validation?.maxLength && stringValue.length > field.validation.maxLength) {
      return `최대 ${field.validation.maxLength}자까지 입력 가능합니다.`
    }
  }

  // Number validation
  if (typeof value === 'number') {
    if (field.validation?.min !== undefined && value < field.validation.min) {
      return `${field.validation.min} 이상의 값을 입력해주세요.`
    }
    if (field.validation?.max !== undefined && value > field.validation.max) {
      return `${field.validation.max} 이하의 값을 입력해주세요.`
    }
  }

  // Email validation
  if (field.type === 'email' && typeof value === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return '올바른 이메일 형식이 아닙니다.'
    }
  }

  // Phone validation (Korean format)
  if (field.type === 'phone' && typeof value === 'string') {
    const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/
    if (!phoneRegex.test(value.replace(/-/g, ''))) {
      return '올바른 휴대폰 번호 형식이 아닙니다.'
    }
  }

  return null
}

export default DynamicFormField
