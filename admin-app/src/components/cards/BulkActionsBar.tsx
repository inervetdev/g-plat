import { X, CheckCircle, XCircle, Palette, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useBulkUpdateCards } from '@/hooks/useCards'

interface BulkActionsBarProps {
  selectedCount: number
  selectedCards: string[]
  onClearSelection: () => void
}

export function BulkActionsBar({
  selectedCount,
  selectedCards,
  onClearSelection,
}: BulkActionsBarProps) {
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const bulkUpdateMutation = useBulkUpdateCards()

  const handleBulkActivate = async () => {
    if (confirm(`선택한 ${selectedCount}개 명함을 활성화하시겠습니까?`)) {
      try {
        await bulkUpdateMutation.mutateAsync({
          cardIds: selectedCards,
          updates: { is_active: true },
        })
        onClearSelection()
      } catch (error) {
        console.error('Bulk activate failed:', error)
        alert('활성화 중 오류가 발생했습니다')
      }
    }
  }

  const handleBulkDeactivate = async () => {
    if (confirm(`선택한 ${selectedCount}개 명함을 비활성화하시겠습니까?`)) {
      try {
        await bulkUpdateMutation.mutateAsync({
          cardIds: selectedCards,
          updates: { is_active: false },
        })
        onClearSelection()
      } catch (error) {
        console.error('Bulk deactivate failed:', error)
        alert('비활성화 중 오류가 발생했습니다')
      }
    }
  }

  const handleBulkThemeChange = async (theme: string) => {
    if (confirm(`선택한 ${selectedCount}개 명함의 테마를 ${theme}로 변경하시겠습니까?`)) {
      try {
        await bulkUpdateMutation.mutateAsync({
          cardIds: selectedCards,
          updates: { theme },
        })
        setShowThemeSelector(false)
        onClearSelection()
      } catch (error) {
        console.error('Bulk theme change failed:', error)
        alert('테마 변경 중 오류가 발생했습니다')
      }
    }
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl p-4 flex items-center gap-4">
        {/* Selection Count */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
          <span className="font-semibold">{selectedCount}개</span>
          <span className="text-sm opacity-75">선택됨</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkActivate}
            disabled={bulkUpdateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>활성화</span>
          </button>

          <button
            onClick={handleBulkDeactivate}
            disabled={bulkUpdateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>비활성화</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
            >
              <Palette className="w-4 h-4" />
              <span>테마 변경</span>
            </button>

            {showThemeSelector && (
              <div className="absolute bottom-full left-0 mb-2 bg-white text-gray-900 rounded-lg shadow-xl p-2 min-w-[150px]">
                {['trendy', 'apple', 'professional', 'simple', 'default'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleBulkThemeChange(theme)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            title="일괄 삭제"
          >
            <Trash2 className="w-4 h-4" />
            <span>삭제</span>
          </button>
        </div>

        {/* Clear Selection */}
        <button
          onClick={onClearSelection}
          className="ml-2 p-2 hover:bg-white/10 rounded-lg transition"
          title="선택 해제"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
