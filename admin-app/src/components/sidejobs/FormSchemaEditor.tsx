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

const DEFAULT_FIELD: FormFieldSchema = {
  name: '',
  label: '',
  type: 'text',
  required: false,
  placeholder: '',
}

export function FormSchemaEditor({ schema, onChange, disabled }: FormSchemaEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const handleAddField = () => {
    const newField: FormFieldSchema = {
      ...DEFAULT_FIELD,
      name: `field_${Date.now()}`,
      label: '새 필드',
    }
    onChange([...schema, newField])
    setExpandedIndex(schema.length)
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
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{field.label}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({FIELD_TYPE_LABELS[field.type]})
                  </span>
                  {field.required && (
                    <span className="ml-2 text-xs text-red-500">필수</span>
                  )}
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        placeholder="field_name"
                      />
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
