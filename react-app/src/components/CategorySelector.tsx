import { useState, useEffect } from 'react'
import type { CategoryPrimary } from '../types/sidejob'
import {
  CATEGORY_CONFIG,
  CATEGORY_SECONDARY_OPTIONS,
  getDefaultCTA
} from '../types/sidejob'

interface CategorySelectorProps {
  selectedPrimary: CategoryPrimary | null
  selectedSecondary: string | null
  onCategoryChange: (primary: CategoryPrimary | null, secondary: string | null) => void
  onCTASuggestion?: (ctaText: string) => void
}

export default function CategorySelector({
  selectedPrimary,
  selectedSecondary,
  onCategoryChange,
  onCTASuggestion
}: CategorySelectorProps) {
  const [localPrimary, setLocalPrimary] = useState<CategoryPrimary | null>(selectedPrimary)
  const [localSecondary, setLocalSecondary] = useState<string | null>(selectedSecondary)

  useEffect(() => {
    setLocalPrimary(selectedPrimary)
    setLocalSecondary(selectedSecondary)
  }, [selectedPrimary, selectedSecondary])

  const handlePrimarySelect = (primary: CategoryPrimary) => {
    setLocalPrimary(primary)
    setLocalSecondary(null) // Reset secondary when primary changes
    onCategoryChange(primary, null)
  }

  const handleSecondarySelect = (secondary: string) => {
    setLocalSecondary(secondary)
    onCategoryChange(localPrimary, secondary)

    // Suggest CTA text
    if (onCTASuggestion && localPrimary) {
      const suggestedCTA = getDefaultCTA(localPrimary, secondary)
      onCTASuggestion(suggestedCTA)
    }
  }

  const secondaryOptions = localPrimary ? CATEGORY_SECONDARY_OPTIONS[localPrimary] : []

  return (
    <div className="space-y-4">
      {/* Primary Category Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          카테고리 선택 *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(CATEGORY_CONFIG) as CategoryPrimary[]).map((key) => {
            const config = CATEGORY_CONFIG[key]
            const Icon = config.icon
            const isSelected = localPrimary === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePrimarySelect(key)}
                className={`
                  relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: config.color }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{config.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {config.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Secondary Category Selection */}
      {localPrimary && secondaryOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            세부 카테고리 선택 *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {secondaryOptions.map((option) => {
              const isSelected = localSecondary === option

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSecondarySelect(option)}
                  className={`
                    px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Helper text */}
      {localPrimary && !localSecondary && (
        <p className="text-xs text-gray-500">
          💡 세부 카테고리를 선택하면 CTA 버튼 텍스트가 자동으로 제안됩니다.
        </p>
      )}
    </div>
  )
}
