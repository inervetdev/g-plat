// Form Schema Editor Component
// 상품별 동적 폼 필드 스키마 편집기

import { useState } from 'react'
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Settings,
  Zap,
} from 'lucide-react'
import type { FormFieldSchema, FormFieldType, FormFieldOption } from '@/types/application'

interface FormSchemaEditorProps {
  schema: FormFieldSchema[]
  onChange: (schema: FormFieldSchema[]) => void
  disabled?: boolean
}

const FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  text: '텍스트',
  number: '숫자',
  email: '이메일',
  phone: '전화번호',
  select: '선택',
  checkbox: '체크박스',
  textarea: '긴 텍스트',
  date: '날짜',
}

// 자주 사용하는 필드 프리셋
const COMMON_FIELD_PRESETS: FormFieldSchema[] = [
  {
    name: 'business_type',
    label: '사업자 유형',
    type: 'select',
    required: true,
    placeholder: '선택해주세요',
    options: [
      { value: 'individual', label: '개인사업자' },
      { value: 'corporate', label: '법인사업자' },
      { value: 'freelancer', label: '프리랜서' },
    ],
  },
  {
    name: 'company_name',
    label: '회사명/상호',
    type: 'text',
    required: true,
    placeholder: '회사명을 입력하세요',
  },
  {
    name: 'business_number',
    label: '사업자등록번호',
    type: 'text',
    required: false,
    placeholder: '000-00-00000',
  },
  {
    name: 'monthly_sales',
    label: '월 매출',
    type: 'select',
    required: false,
    placeholder: '선택해주세요',
    options: [
      { value: 'under_10m', label: '1천만원 미만' },
      { value: '10m_50m', label: '1천만원~5천만원' },
      { value: '50m_100m', label: '5천만원~1억원' },
      { value: 'over_100m', label: '1억원 이상' },
    ],
  },
  {
    name: 'employee_count',
    label: '직원 수',
    type: 'select',
    required: false,
    placeholder: '선택해주세요',
    options: [
      { value: '1', label: '1명 (본인만)' },
      { value: '2_5', label: '2~5명' },
      { value: '6_10', label: '6~10명' },
      { value: 'over_10', label: '10명 이상' },
    ],
  },
  {
    name: 'address',
    label: '사업장 주소',
    type: 'text',
    required: false,
    placeholder: '주소를 입력하세요',
  },
  {
    name: 'inquiry_content',
    label: '문의 내용',
    type: 'textarea',
    required: false,
    placeholder: '추가 문의사항을 입력하세요',
  },
  {
    name: 'preferred_contact_time',
    label: '희망 연락 시간',
    type: 'select',
    required: false,
    placeholder: '선택해주세요',
    options: [
      { value: 'morning', label: '오전 (9시~12시)' },
      { value: 'afternoon', label: '오후 (12시~18시)' },
      { value: 'evening', label: '저녁 (18시~21시)' },
      { value: 'anytime', label: '언제든지' },
    ],
  },
]

const DEFAULT_FIELD: FormFieldSchema = {
  name: '',
  label: '',
  type: 'text',
  required: false,
  placeholder: '',
}

export function FormSchemaEditor({ schema, onChange, disabled }: FormSchemaEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [showPresets, setShowPresets] = useState(false)

  // 타입 기반 시퀀스 ID 생성
  const generateFieldId = (type: FormFieldType): string => {
    const existingOfType = schema.filter(f => f.name.startsWith(`${type}_`)).length
    return `${type}_${existingOfType + 1}`
  }

  const handleAddField = () => {
    const type: FormFieldType = 'text'
    const newField: FormFieldSchema = {
      ...DEFAULT_FIELD,
      name: generateFieldId(type),
      label: '새 필드',
      type,
    }
    onChange([...schema, newField])
    setExpandedIndex(schema.length)
  }

  // 프리셋 필드 추가
  const handleAddPreset = (preset: FormFieldSchema) => {
    // 이미 같은 ID가 있으면 숫자 붙이기
    let fieldName = preset.name
    const existingNames = schema.map(f => f.name)
    if (existingNames.includes(fieldName)) {
      let counter = 2
      while (existingNames.includes(`${preset.name}_${counter}`)) {
        counter++
      }
      fieldName = `${preset.name}_${counter}`
    }

    const newField: FormFieldSchema = {
      ...preset,
      name: fieldName,
    }
    onChange([...schema, newField])
    setExpandedIndex(schema.length)
    setShowPresets(false)
  }

  const handleRemoveField = (index: number) => {
    const newSchema = schema.filter((_, i) => i !== index)
    onChange(newSchema)
    if (expandedIndex === index) {
      setExpandedIndex(null)
    }
  }

  const handleUpdateField = (index: number, updates: Partial<FormFieldSchema>) => {
    const newSchema = schema.map((field, i) =>
      i === index ? { ...field, ...updates } : field
    )
    onChange(newSchema)
  }

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= schema.length) return

    const newSchema = [...schema]
    const temp = newSchema[index]
    newSchema[index] = newSchema[newIndex]
    newSchema[newIndex] = temp
    onChange(newSchema)

    if (expandedIndex === index) {
      setExpandedIndex(newIndex)
    } else if (expandedIndex === newIndex) {
      setExpandedIndex(index)
    }
  }

  const handleAddOption = (fieldIndex: number) => {
    const field = schema[fieldIndex]
    const options = field.options || []
    const newOptions: FormFieldOption[] = [
      ...options,
      { value: `option_${options.length + 1}`, label: `옵션 ${options.length + 1}` },
    ]
    handleUpdateField(fieldIndex, { options: newOptions })
  }

  const handleUpdateOption = (
    fieldIndex: number,
    optionIndex: number,
    updates: Partial<FormFieldOption>
  ) => {
    const field = schema[fieldIndex]
    const options = field.options || []
    const newOptions = options.map((opt, i) =>
      i === optionIndex ? { ...opt, ...updates } : opt
    )
    handleUpdateField(fieldIndex, { options: newOptions })
  }

  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    const field = schema[fieldIndex]
    const options = field.options || []
    const newOptions = options.filter((_, i) => i !== optionIndex)
    handleUpdateField(fieldIndex, { options: newOptions })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">신청 폼 필드</h3>
          <p className="text-xs text-gray-500">상품 신청 시 추가로 입력받을 정보를 설정합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            disabled={disabled}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            빠른 추가
          </button>
          <button
            type="button"
            onClick={handleAddField}
            disabled={disabled}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            필드 추가
          </button>
        </div>
      </div>

      {/* Preset Selection */}
      {showPresets && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-amber-900">자주 사용하는 필드</h4>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-amber-600 hover:text-amber-800 text-xs"
            >
              닫기
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_FIELD_PRESETS.map((preset) => {
              const isAlreadyAdded = schema.some(f => f.name === preset.name)
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  disabled={disabled}
                  className={`px-3 py-1.5 text-xs rounded-full border transition ${
                    isAlreadyAdded
                      ? 'bg-gray-100 border-gray-300 text-gray-500'
                      : 'bg-white border-amber-300 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  {preset.label}
                  {isAlreadyAdded && ' ✓'}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-amber-700 mt-3">
            클릭하면 필드가 추가됩니다. 이미 추가된 필드는 _2, _3 형태로 번호가 붙습니다.
          </p>
        </div>
      )}

      {/* Field List */}
      {schema.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">추가된 필드가 없습니다</p>
          <p className="text-xs text-gray-400 mt-1">
            기본 정보(이름, 연락처, 이메일) 외에 추가로 입력받을 정보가 있으면 필드를 추가하세요
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {schema.map((field, index) => (
            <div
              key={field.name}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Field Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{field.label}</span>
                    <span className="text-xs text-gray-500">
                      ({FIELD_TYPE_LABELS[field.type]})
                    </span>
                    {field.required && (
                      <span className="text-xs text-red-500">필수</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-mono truncate block">
                    {field.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveField(index, 'up')
                    }}
                    disabled={index === 0 || disabled}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveField(index, 'down')
                    }}
                    disabled={index === schema.length - 1 || disabled}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveField(index)
                    }}
                    disabled={disabled}
                    className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Field Details (Expanded) */}
              {expandedIndex === index && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Field Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        필드 ID
                        <span className="ml-1 text-gray-400 font-normal">(영문, 숫자, _만 사용)</span>
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          handleUpdateField(index, {
                            name: e.target.value.replace(/[^a-z0-9_]/gi, '_').toLowerCase(),
                          })
                        }
                        disabled={disabled}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono"
                        placeholder="예: business_type, company_name"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        데이터 저장/검색에 사용됩니다. 의미 있는 ID 권장
                      </p>
                    </div>

                    {/* Label */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        라벨
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                        disabled={disabled}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        placeholder="필드 라벨"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        타입
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleUpdateField(index, { type: e.target.value as FormFieldType })
                        }
                        disabled={disabled}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      >
                        {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Required */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required_${index}`}
                        checked={field.required}
                        onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                        disabled={disabled}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor={`required_${index}`}
                        className="text-sm text-gray-700"
                      >
                        필수 입력
                      </label>
                    </div>
                  </div>

                  {/* Placeholder */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      플레이스홀더
                    </label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => handleUpdateField(index, { placeholder: e.target.value })}
                      disabled={disabled}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      placeholder="입력 안내 텍스트"
                    />
                  </div>

                  {/* Help Text */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      도움말
                    </label>
                    <input
                      type="text"
                      value={field.helpText || ''}
                      onChange={(e) => handleUpdateField(index, { helpText: e.target.value })}
                      disabled={disabled}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      placeholder="필드 아래 표시될 도움말"
                    />
                  </div>

                  {/* Options (for select type) */}
                  {field.type === 'select' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-700">
                          선택 옵션
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddOption(index)}
                          disabled={disabled}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          + 옵션 추가
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(field.options || []).map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) =>
                                handleUpdateOption(index, optIndex, { value: e.target.value })
                              }
                              disabled={disabled}
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                              placeholder="값"
                            />
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) =>
                                handleUpdateOption(index, optIndex, { label: e.target.value })
                              }
                              disabled={disabled}
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                              placeholder="표시 라벨"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index, optIndex)}
                              disabled={disabled}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {(!field.options || field.options.length === 0) && (
                          <p className="text-xs text-gray-400 text-center py-2">
                            옵션을 추가하세요
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FormSchemaEditor
