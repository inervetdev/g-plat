import { useState } from 'react'
import {
  X,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  Monitor,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  MessageSquare,
  Award,
  Loader2,
} from 'lucide-react'
import {
  useApplicationLogs,
  useAdminUsers,
  useAssignApplication,
  useUpdateApplicationStatus,
  useCompleteApplication,
  useCancelApplication,
  useUpdateRewardStatus,
} from '@/hooks/useApplications'
import type {
  ProductApplicationWithRelations,
  ApplicationStatus,
  RewardType,
  RewardStatus,
} from '@/types/application'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  REWARD_TYPE_LABELS,
  REWARD_STATUS_LABELS,
} from '@/types/application'

interface ApplicationDetailModalProps {
  application: ProductApplicationWithRelations
  isOpen: boolean
  onClose: () => void
}

export function ApplicationDetailModal({
  application,
  isOpen,
  onClose,
}: ApplicationDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'actions' | 'logs'>('info')
  const [processingNote, setProcessingNote] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState(application.assigned_to || '')
  const [rewardType, setRewardType] = useState<RewardType>(application.referrer_reward_type || 'none')
  const [rewardAmount, setRewardAmount] = useState(application.referrer_reward_amount || 0)

  // Queries
  const { data: logs, isLoading: isLoadingLogs } = useApplicationLogs(application.id)
  const { data: adminUsers } = useAdminUsers()

  // Mutations
  const assignMutation = useAssignApplication()
  const updateStatusMutation = useUpdateApplicationStatus()
  const completeMutation = useCompleteApplication()
  const cancelMutation = useCancelApplication()
  const updateRewardMutation = useUpdateRewardStatus()

  if (!isOpen) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
    const colors = APPLICATION_STATUS_COLORS[status]
    const label = APPLICATION_STATUS_LABELS[status]
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
        {label}
      </span>
    )
  }

  const handleAssign = async () => {
    if (!selectedAssignee) return
    await assignMutation.mutateAsync({
      id: application.id,
      input: { assigned_to: selectedAssignee },
    })
  }

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    await updateStatusMutation.mutateAsync({
      id: application.id,
      input: { status: newStatus, processing_note: processingNote },
    })
  }

  const handleComplete = async () => {
    await completeMutation.mutateAsync({
      id: application.id,
      input: {
        processing_note: processingNote,
        referrer_reward_type: rewardType,
        referrer_reward_amount: rewardAmount,
        referrer_reward_status: 'pending',
      },
    })
    onClose()
  }

  const handleCancel = async () => {
    if (window.confirm('정말 이 신청을 취소하시겠습니까?')) {
      await cancelMutation.mutateAsync({
        id: application.id,
        note: processingNote,
      })
      onClose()
    }
  }

  const handleRewardStatusChange = async (status: RewardStatus) => {
    await updateRewardMutation.mutateAsync({
      id: application.id,
      status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">신청 상세</h2>
              <p className="text-sm text-gray-500">ID: {application.id.slice(0, 8)}...</p>
            </div>
            <StatusBadge status={application.status} />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            신청 정보
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'actions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            처리
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            처리 이력
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Applicant Info */}
              <div className="space-y-6">
                {/* Product Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">상품 정보</h3>
                  <div className="flex items-center gap-4">
                    {application.template?.image_url ? (
                      <img
                        src={application.template.image_url}
                        alt={application.template.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {application.template?.title || '알 수 없음'}
                      </p>
                      {application.template?.partner_name && (
                        <p className="text-sm text-gray-500">
                          {application.template.partner_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Applicant Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">신청자 정보</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{application.applicant_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{application.applicant_phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{application.applicant_email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{formatDate(application.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{application.device_type || 'unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Form Data */}
                {Object.keys(application.form_data).length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">추가 정보</h3>
                    <div className="space-y-2">
                      {Object.entries(application.form_data).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}</span>
                          <span className="text-gray-900 font-medium">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Referrer & Status */}
              <div className="space-y-6">
                {/* Referrer Info */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">추천인 정보</h3>
                  {application.referrer ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">이름</span>
                        <span className="text-blue-900 font-medium">
                          {application.referrer.name || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">이메일</span>
                        <span className="text-blue-900 font-medium">
                          {application.referrer.email}
                        </span>
                      </div>
                      {application.referrer_card_url && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">명함 URL</span>
                          <span className="text-blue-900 font-medium">
                            /{application.referrer_card_url}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-blue-700">추천인 없음 (직접 유입)</p>
                  )}
                </div>

                {/* Reward Info */}
                {application.referrer && (
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      추천인 보상
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-yellow-700">보상 유형</span>
                        <span className="text-yellow-900 font-medium">
                          {application.referrer_reward_type
                            ? REWARD_TYPE_LABELS[application.referrer_reward_type]
                            : '미설정'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">보상 금액</span>
                        <span className="text-yellow-900 font-medium">
                          {application.referrer_reward_amount.toLocaleString()}
                          {application.referrer_reward_type === 'points' ? 'P' : '원'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-700">보상 상태</span>
                        <span className="text-yellow-900 font-medium">
                          {REWARD_STATUS_LABELS[application.referrer_reward_status]}
                        </span>
                      </div>
                      {application.status === 'completed' && application.referrer_reward_type !== 'none' && (
                        <div className="flex gap-2 mt-3">
                          {application.referrer_reward_status === 'pending' && (
                            <button
                              onClick={() => handleRewardStatusChange('approved')}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              승인
                            </button>
                          )}
                          {application.referrer_reward_status === 'approved' && (
                            <button
                              onClick={() => handleRewardStatusChange('paid')}
                              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              지급 완료
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assignee Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">담당자</h3>
                  {application.assignee ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-blue-600">
                          {application.assignee.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{application.assignee.name}</p>
                        <p className="text-sm text-gray-500">{application.assignee.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">미배정</p>
                  )}
                  {application.assigned_at && (
                    <p className="text-sm text-gray-500 mt-2">
                      배정일: {formatDate(application.assigned_at)}
                    </p>
                  )}
                </div>

                {/* Processing Note */}
                {application.processing_note && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      처리 메모
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {application.processing_note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Assign */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  담당자 배정
                </h3>
                <div className="flex gap-3">
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">담당자 선택</option>
                    {adminUsers?.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedAssignee || assignMutation.isPending}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {assignMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      '배정'
                    )}
                  </button>
                </div>
              </div>

              {/* Status Change */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  상태 변경
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'assigned', 'processing'] as ApplicationStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={application.status === status || updateStatusMutation.isPending}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        application.status === status
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {APPLICATION_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Processing Note */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">처리 메모</h3>
                <textarea
                  value={processingNote}
                  onChange={(e) => setProcessingNote(e.target.value)}
                  placeholder="처리 관련 메모를 입력하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-y min-h-[100px]"
                />
              </div>

              {/* Reward Setting (for completion) */}
              {application.referrer && application.status !== 'completed' && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-900 mb-3">보상 설정</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">
                        보상 유형
                      </label>
                      <select
                        value={rewardType}
                        onChange={(e) => setRewardType(e.target.value as RewardType)}
                        className="w-full px-4 py-2 border border-yellow-300 rounded-lg"
                      >
                        <option value="none">없음</option>
                        <option value="commission">수수료</option>
                        <option value="points">포인트</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">
                        보상 금액
                      </label>
                      <input
                        type="number"
                        value={rewardAmount}
                        onChange={(e) => setRewardAmount(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-yellow-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Complete/Cancel Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleComplete}
                  disabled={completeMutation.isPending || application.status === 'completed'}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  {completeMutation.isPending ? '처리 중...' : '처리 완료'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending || application.status === 'cancelled'}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  취소
                </button>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              {isLoadingLogs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : logs && logs.length > 0 ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{log.action}</span>
                        {log.previous_status && log.new_status && (
                          <span className="text-sm text-gray-500">
                            {APPLICATION_STATUS_LABELS[log.previous_status as ApplicationStatus]} →{' '}
                            {APPLICATION_STATUS_LABELS[log.new_status as ApplicationStatus]}
                          </span>
                        )}
                      </div>
                      {log.note && (
                        <p className="text-sm text-gray-600 mb-1">{log.note}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatDate(log.created_at)}
                        {log.performed_by_name && ` · ${log.performed_by_name}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  처리 이력이 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationDetailModal
