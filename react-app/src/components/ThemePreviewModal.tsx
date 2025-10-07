import { useState, useEffect } from 'react'
import { TrendyCard } from './themes/TrendyCard'
import { AppleCard } from './themes/AppleCard'
import { ProfessionalCard } from './themes/ProfessionalCard'
import { SimpleCard } from './themes/SimpleCard'
import { DefaultCard } from './themes/DefaultCard'

interface ThemePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  currentTheme: string
  onSelectTheme: (theme: string) => void
}

const themes = [
  { id: 'trendy', name: '트렌디', emoji: '✨', component: TrendyCard },
  { id: 'apple', name: '애플', emoji: '🍎', component: AppleCard },
  { id: 'professional', name: '프로페셔널', emoji: '💼', component: ProfessionalCard },
  { id: 'simple', name: '심플', emoji: '⚪', component: SimpleCard },
  { id: 'default', name: '기본', emoji: '🎨', component: DefaultCard }
]

export default function ThemePreviewModal({ isOpen, onClose, currentTheme, onSelectTheme }: ThemePreviewModalProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)
  const [previewTheme, setPreviewTheme] = useState(currentTheme)

  // Reset state when modal opens with current theme
  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(currentTheme)
      setPreviewTheme(currentTheme)
    }
  }, [isOpen, currentTheme])

  if (!isOpen) return null

  const PreviewComponent = themes.find(t => t.id === previewTheme)?.component || TrendyCard

  const handleSelect = () => {
    onSelectTheme(selectedTheme)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
            <h2 className="text-xl font-semibold text-gray-900">테마 미리보기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row h-[calc(90vh-140px)]">
            {/* Theme Selector */}
            <div className="lg:w-64 border-r bg-gray-50 p-4 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">테마 선택</h3>
              <div className="space-y-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedTheme(theme.id)
                      setPreviewTheme(theme.id)
                    }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{theme.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-900">{theme.name}</p>
                        {selectedTheme === theme.id && (
                          <p className="text-xs text-blue-600">선택됨</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-y-auto bg-gray-100">
              <div className="min-h-full">
                <PreviewComponent userId="demo-preview" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              현재 선택: <span className="font-semibold">{themes.find(t => t.id === selectedTheme)?.name}</span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSelect}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                이 테마 선택
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
