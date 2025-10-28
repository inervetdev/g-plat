import { useState } from 'react'
import { X, AlertTriangle, CheckCircle, Ban } from 'lucide-react'
import { useUpdateUserStatus } from '@/hooks/useUsers'
import type { UserWithStats } from '@/types/admin'

interface UserStatusModalProps {
  user: UserWithStats
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type StatusAction = 'activate' | 'deactivate' | 'suspend' | null

export function UserStatusModal({ user, isOpen, onClose, onSuccess }: UserStatusModalProps) {
  const [action, setAction] = useState<StatusAction>(null)
  const [reason, setReason] = useState('')
  const updateStatusMutation = useUpdateUserStatus()

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!action) return

    let newStatus: 'active' | 'inactive' | 'suspended'

    if (action === 'activate') {
      newStatus = 'active'
    } else if (action === 'deactivate') {
      newStatus = 'inactive'
    } else {
      newStatus = 'suspended'
    }

    // Validate suspend reason
    if (action === 'suspend' && !reason.trim()) {
      alert('정지 사유를 입력해주세요')
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        userId: user.id,
        status: newStatus,
        reason: reason.trim() || undefined,
      })

      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error('Failed to update user status:', error)
      alert('상태 변경에 실패했습니다')
    }
  }

  const handleClose = () => {
    setAction(null)
    setReason('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">사용자 상태 변경</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600">현재 상태:</p>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                  user.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : user.status === 'suspended'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.status === 'active' ? '활성' : user.status === 'suspended' ? '정지' : '비활성'}
              </span>
            </div>
          </div>

          {/* Action Selection */}
          {!action ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-3">변경할 상태를 선택하세요:</p>

              {/* Activate */}
              {user.status !== 'active' && (
                <button
                  onClick={() => setAction('activate')}
                  className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
                >
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">활성화</p>
                    <p className="text-sm text-gray-500">사용자 계정을 정상적으로 사용 가능하게 합니다</p>
                  </div>
                </button>
              )}

              {/* Deactivate */}
              {user.status !== 'inactive' && (
                <button
                  onClick={() => setAction('deactivate')}
                  className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition"
                >
                  <Ban className="w-6 h-6 text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">비활성화</p>
                    <p className="text-sm text-gray-500">사용자 계정을 일시적으로 비활성화합니다</p>
                  </div>
                </button>
              )}

              {/* Suspend */}
              {user.status !== 'suspended' && (
                <button
                  onClick={() => setAction('suspend')}
                  className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
                >
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">정지</p>
                    <p className="text-sm text-gray-500">사용자 계정을 정지합니다 (사유 입력 필수)</p>
                  </div>
                </button>
              )}
            </div>
          ) : (
            /* Confirmation Form */
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg ${
                  action === 'activate'
                    ? 'bg-green-50 border border-green-200'
                    : action === 'deactivate'
                    ? 'bg-gray-50 border border-gray-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {action === 'activate' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {action === 'deactivate' && <Ban className="w-5 h-5 text-gray-600" />}
                  {action === 'suspend' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  <p className="font-medium text-gray-900">
                    {action === 'activate' && '활성화'}
                    {action === 'deactivate' && '비활성화'}
                    {action === 'suspend' && '정지'}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {action === 'activate' &&
                    '사용자가 정상적으로 서비스를 이용할 수 있습니다.'}
                  {action === 'deactivate' &&
                    '사용자는 로그인할 수 없으며, 명함도 비공개 처리됩니다.'}
                  {action === 'suspend' &&
                    '사용자는 로그인할 수 없으며, 모든 기능이 차단됩니다.'}
                </p>
              </div>

              {/* Reason Input for Suspend */}
              {action === 'suspend' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    정지 사유 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="정지 사유를 입력하세요 (필수)"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {/* Optional Note for Other Actions */}
              {action !== 'suspend' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    메모 (선택사항)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="변경 사유를 메모할 수 있습니다"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  뒤로
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={updateStatusMutation.isPending}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
                    action === 'activate'
                      ? 'bg-green-600 hover:bg-green-700'
                      : action === 'deactivate'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {updateStatusMutation.isPending ? '처리 중...' : '확인'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!action && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <p className="text-xs text-gray-500">
              ⚠️ 상태 변경 내역은 감사 로그에 자동으로 기록됩니다
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
