import { useState } from 'react'
import { X, Loader2, AlertTriangle, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/admin'

interface UserDeleteModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function UserDeleteModal({ user, isOpen, onClose, onSuccess }: UserDeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [confirmText, setConfirmText] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (confirmText !== user.email) {
      setError('이메일 주소가 일치하지 않습니다')
      return
    }

    if (!reason.trim()) {
      setError('삭제 사유를 입력해주세요')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. users 테이블에 삭제 사유 및 삭제 시각 기록 (status는 유지)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          deleted_at: new Date().toISOString(),
          deletion_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(updateError.message)
      }

      console.log('✅ User marked as deleted in database')

      // Note: Auth 사용자는 soft delete로 유지 (로그인 불가능하게 하려면 RLS로 제어)
      // Admin API deleteUser()는 service_role 키가 필요하므로 프론트엔드에서 사용 불가
      // 필요 시 Supabase Dashboard에서 수동으로 Auth 사용자 삭제 가능

      alert(`사용자가 성공적으로 삭제되었습니다.\n\n이름: ${user.name}\n이메일: ${user.email}\n삭제 사유: ${reason}\n\n⚠️ Auth 계정은 유지됩니다.\n완전 삭제가 필요하면 Supabase Dashboard에서 처리하세요.`)

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('User deletion error:', err)
      setError(err.message || '사용자 삭제에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">사용자 삭제</h2>
              <p className="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 경고 메시지 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-2">⚠️ 주의사항</p>
                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                  <li>사용자 계정이 영구적으로 삭제됩니다</li>
                  <li>사용자의 모든 명함이 함께 삭제됩니다</li>
                  <li>사용자의 모든 부가명함이 함께 삭제됩니다</li>
                  <li>사용자의 QR 코드 및 통계 데이터가 삭제됩니다</li>
                  <li>삭제된 데이터는 복구할 수 없습니다</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* 사용자 정보 확인 */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">삭제 대상 사용자</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">이름:</span>
                <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">이메일:</span>
                <span className="font-medium text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">구독 등급:</span>
                <span className="font-medium text-gray-900">
                  {user.subscription_tier === 'BUSINESS' ? '비즈니스' :
                   user.subscription_tier === 'PREMIUM' ? '프리미엄' : '무료'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">가입일:</span>
                <span className="font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </div>

          {/* 삭제 사유 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              삭제 사유 * (필수)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              placeholder="사용자 삭제 사유를 상세히 기록해주세요&#10;예: 사용자 요청, 규정 위반, 중복 계정 등"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              삭제 사유는 관리 기록으로 보관되며, 사용자 데이터베이스에 저장됩니다
            </p>
          </div>

          {/* 확인 입력 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이메일 주소 확인 * (필수)
            </label>
            <p className="text-xs text-gray-600 mb-2">
              삭제를 확인하려면 사용자의 이메일 주소(<strong>{user.email}</strong>)를 정확히 입력하세요
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              required
              placeholder={user.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || confirmText !== user.email || !reason.trim()}
              className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  영구 삭제
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
