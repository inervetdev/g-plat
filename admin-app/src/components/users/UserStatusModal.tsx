import { useState } from 'react'
import { X, AlertTriangle, CheckCircle, Ban, Trash2 } from 'lucide-react'
import { useUpdateUserStatus, useDeleteUser } from '@/hooks/useUsers'
import type { UserWithStats } from '@/types/admin'

interface UserStatusModalProps {
  user: UserWithStats
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type StatusAction = 'activate' | 'deactivate' | 'suspend' | 'deleted' | null

export function UserStatusModal({ user, isOpen, onClose, onSuccess }: UserStatusModalProps) {
  const [action, setAction] = useState<StatusAction>(null)
  const [reason, setReason] = useState('')
  const updateStatusMutation = useUpdateUserStatus()
  const deleteUserMutation = useDeleteUser()

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!action) return

    // Handle soft delete (deleted status - 삭제대기)
    if (action === 'deleted') {
      // Validate deletion reason
      if (!reason.trim()) {
        alert('삭제 사유를 입력해주세요')
        return
      }

      // Confirm deletion
      if (!confirm(`사용자를 삭제대기 상태로 변경하시겠습니까?\n\n사용자는 로그인할 수 없으며, 삭제 정보 카드에서 완전 삭제 또는 복구를 선택할 수 있습니다.\n\n삭제 사유: ${reason.trim()}`)) {
        return
      }

      try {
        // Soft delete: permanent = false
        await deleteUserMutation.mutateAsync({
          userId: user.id,
          permanent: false,
          reason: reason.trim(),
        })

        alert('사용자가 삭제대기 상태로 변경되었습니다')
        onSuccess?.()
        handleClose()
      } catch (error) {
        console.error('Failed to mark user as deleted:', error)
        alert('삭제대기 처리에 실패했습니다')
      }
      return
    }

    // Handle status change actions
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

              {/* Deleted (삭제대기) */}
              <button
                onClick={() => setAction('deleted')}
                className="w-full flex items-center gap-3 p-4 border-2 border-orange-300 rounded-lg hover:border-orange-600 hover:bg-orange-100 transition bg-orange-50"
              >
                <Trash2 className="w-6 h-6 text-orange-700" />
                <div className="text-left">
                  <p className="font-medium text-orange-900">삭제대기</p>
                  <p className="text-sm text-orange-600">사용자를 삭제대기 상태로 변경합니다 (복구 가능)</p>
                </div>
              </button>
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
                    : action === 'deleted'
                    ? 'bg-orange-100 border-2 border-orange-400'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {action === 'activate' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {action === 'deactivate' && <Ban className="w-5 h-5 text-gray-600" />}
                  {action === 'suspend' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {action === 'deleted' && <Trash2 className="w-5 h-5 text-orange-700" />}
                  <p className="font-medium text-gray-900">
                    {action === 'activate' && '활성화'}
                    {action === 'deactivate' && '비활성화'}
                    {action === 'suspend' && '정지'}
                    {action === 'deleted' && '삭제대기'}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {action === 'activate' &&
                    '사용자가 정상적으로 서비스를 이용할 수 있습니다.'}
                  {action === 'deactivate' &&
                    '사용자는 로그인은 가능하되 생성/수정이 불가능하며, 삭제만 가능합니다. 모든 명함과 부가명함이 비활성화됩니다.'}
                  {action === 'suspend' &&
                    '사용자는 로그인할 수 없으며, 모든 기능이 차단됩니다. 모든 명함과 부가명함이 비활성화됩니다.'}
                  {action === 'deleted' &&
                    '⚠️ 사용자는 로그인할 수 없으며, 삭제대기 상태가 됩니다. 사용자 상세 페이지에서 완전 삭제 또는 복구를 선택할 수 있습니다.'}
                </p>
              </div>

              {/* Reason Input for Suspend and Deleted */}
              {(action === 'suspend' || action === 'deleted') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {action === 'deleted' ? '삭제' : '정지'} 사유 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={`${action === 'deleted' ? '삭제' : '정지'} 사유를 입력하세요 (필수)`}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      action === 'deleted'
                        ? 'border-orange-300 focus:ring-orange-500'
                        : 'border-gray-200 focus:ring-red-500'
                    }`}
                  />
                </div>
              )}

              {/* Optional Note for Other Actions */}
              {action !== 'suspend' && action !== 'deleted' && (
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
                  disabled={updateStatusMutation.isPending || deleteUserMutation.isPending}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
                    action === 'activate'
                      ? 'bg-green-600 hover:bg-green-700'
                      : action === 'deactivate'
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : action === 'deleted'
                      ? 'bg-orange-600 hover:bg-orange-700 font-bold'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {(updateStatusMutation.isPending || deleteUserMutation.isPending)
                    ? '처리 중...'
                    : action === 'deleted'
                    ? '삭제대기 처리'
                    : '확인'}
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
