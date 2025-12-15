import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import {
  X,
  Flag,
  User,
  CreditCard,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Ban,
  AlertTriangle,
  Mail,
  ExternalLink,
  Loader2,
  History,
} from 'lucide-react'
import { resolveReport, fetchReportLogs } from '@/lib/api/reports'
import type { ReportWithDetails, Report } from '@/types/admin'
import { useAuthStore } from '@/stores/authStore'

interface ReportDetailModalProps {
  report: ReportWithDetails
  isOpen: boolean
  onClose: () => void
}

// 신고 사유 라벨
const REPORT_TYPE_LABELS: Record<string, string> = {
  spam: '스팸/광고',
  inappropriate: '부적절한 콘텐츠',
  fraud: '사기/허위',
  copyright: '저작권 침해',
  privacy: '개인정보 노출',
  other: '기타',
}

// 심각도 라벨
const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: '낮음', color: 'bg-green-100 text-green-800' },
  medium: { label: '중간', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: '높음', color: 'bg-red-100 text-red-800' },
}

// 상태 라벨
const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: '대기', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  investigating: { label: '검토중', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  resolved: { label: '완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: '기각', color: 'bg-gray-100 text-gray-800', icon: XCircle },
}

// 조치 옵션
const RESOLUTION_ACTIONS: Array<{
  action: Report['resolution_action']
  label: string
  description: string
  icon: React.ElementType
  color: string
}> = [
  {
    action: 'delete_content',
    label: '콘텐츠 삭제',
    description: '해당 콘텐츠를 삭제합니다',
    icon: Trash2,
    color: 'bg-red-600 hover:bg-red-700',
  },
  {
    action: 'disable_content',
    label: '콘텐츠 비활성화',
    description: '해당 콘텐츠를 비공개 처리합니다',
    icon: XCircle,
    color: 'bg-orange-600 hover:bg-orange-700',
  },
  {
    action: 'warn_user',
    label: '사용자 경고',
    description: '콘텐츠 소유자에게 경고를 발송합니다',
    icon: AlertTriangle,
    color: 'bg-yellow-600 hover:bg-yellow-700',
  },
  {
    action: 'suspend_user',
    label: '사용자 정지',
    description: '콘텐츠 소유자 계정을 일시 정지합니다',
    icon: Ban,
    color: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    action: 'reject_report',
    label: '신고 기각',
    description: '부적절한 신고로 처리합니다',
    icon: XCircle,
    color: 'bg-gray-600 hover:bg-gray-700',
  },
]

export function ReportDetailModal({ report, isOpen, onClose }: ReportDetailModalProps) {
  const queryClient = useQueryClient()
  const { user: adminUser } = useAuthStore()
  const [selectedAction, setSelectedAction] = useState<Report['resolution_action'] | null>(null)
  const [note, setNote] = useState('')
  const [notifyReporter, setNotifyReporter] = useState(true)
  const [showLogs, setShowLogs] = useState(false)

  // Fetch logs
  const { data: logs } = useQuery({
    queryKey: ['report-logs', report.id],
    queryFn: () => fetchReportLogs(report.id),
    enabled: showLogs,
  })

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: () =>
      resolveReport(report.id, adminUser?.id || '', {
        action: selectedAction,
        note,
        notify_reporter: notifyReporter,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['report-stats'] })
      onClose()
    },
  })

  if (!isOpen) return null

  const statusInfo = STATUS_LABELS[report.status]
  const StatusIcon = statusInfo.icon
  const severityInfo = SEVERITY_LABELS[report.severity]
  const isResolved = report.status === 'resolved' || report.status === 'rejected'

  // Get target info
  const getTargetInfo = () => {
    if (report.target_card) {
      return {
        type: '명함',
        name: report.target_card.name,
        detail: report.target_card.company || '-',
        icon: CreditCard,
        url: `/cards/${report.target_card.id}`,
      }
    }
    if (report.target_sidejob) {
      return {
        type: '부가명함',
        name: report.target_sidejob.title,
        detail: report.target_sidejob.category || '-',
        icon: ShoppingBag,
        url: `/sidejobs`,
      }
    }
    if (report.target_user) {
      return {
        type: '사용자',
        name: report.target_user.name,
        detail: report.target_user.email,
        icon: User,
        url: `/users/${report.target_user.id}`,
      }
    }
    return { type: '-', name: '-', detail: '-', icon: Flag, url: '#' }
  }

  const targetInfo = getTargetInfo()
  const TargetIcon = targetInfo.icon

  const handleSubmit = () => {
    if (!selectedAction || !note.trim()) return
    resolveMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">신고 상세</h2>
              <p className="text-sm text-gray-500">#{report.id.slice(0, 8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left - Report Info */}
            <div className="space-y-6">
              {/* Status & Basic Info */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">신고 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">상태</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">유형</span>
                    <span className="text-sm font-medium text-gray-900">
                      {REPORT_TYPE_LABELS[report.report_type]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">심각도</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${severityInfo.color}`}
                    >
                      {severityInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">접수일</span>
                    <span className="text-sm text-gray-900">
                      {new Date(report.created_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  {report.reviewed_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">검토일</span>
                      <span className="text-sm text-gray-900">
                        {new Date(report.reviewed_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                  )}
                  {report.resolved_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">처리일</span>
                      <span className="text-sm text-gray-900">
                        {new Date(report.resolved_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reporter Info */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">신고자 정보</h3>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {report.reporter?.email || report.reporter_email || '익명'}
                    </p>
                    {report.reporter_ip && (
                      <p className="text-xs text-gray-500">IP: {report.reporter_ip}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {report.description && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">신고 설명</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.description}</p>
                </div>
              )}

              {/* Resolution Note (if resolved) */}
              {report.resolution_note && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-700 mb-3">처리 결과</h3>
                  <p className="text-sm text-blue-800">{report.resolution_note}</p>
                  {report.reviewed_by_admin && (
                    <p className="text-xs text-blue-600 mt-2">
                      처리자: {report.reviewed_by_admin.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right - Target Info & Actions */}
            <div className="space-y-6">
              {/* Target Preview */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">신고 대상</h3>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <TargetIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">{targetInfo.type}</p>
                    <p className="font-semibold text-gray-900">{targetInfo.name}</p>
                    <p className="text-sm text-gray-600">{targetInfo.detail}</p>
                    {report.target_owner && (
                      <p className="text-xs text-gray-500 mt-2">
                        소유자: {report.target_owner.name} ({report.target_owner.email})
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={targetInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  상세 보기
                </a>
              </div>

              {/* Action Buttons (if not resolved) */}
              {!isResolved && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">조치 선택</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {RESOLUTION_ACTIONS.map((action) => {
                      const ActionIcon = action.icon
                      const isSelected = selectedAction === action.action
                      return (
                        <button
                          key={action.action}
                          onClick={() => setSelectedAction(action.action)}
                          className={`p-3 rounded-lg border-2 transition text-left ${
                            isSelected
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <ActionIcon
                              className={`w-4 h-4 ${isSelected ? 'text-red-600' : 'text-gray-500'}`}
                            />
                            <span
                              className={`text-sm font-medium ${
                                isSelected ? 'text-red-700' : 'text-gray-700'
                              }`}
                            >
                              {action.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{action.description}</p>
                        </button>
                      )
                    })}
                  </div>

                  {/* Note Input */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      관리자 메모 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="처리 사유를 입력하세요..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>

                  {/* Notify Option */}
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyReporter}
                      onChange={(e) => setNotifyReporter(e.target.checked)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-600">신고자에게 결과 통보</span>
                    <Mail className="w-4 h-4 text-gray-400" />
                  </label>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedAction || !note.trim() || resolveMutation.isPending}
                    className="mt-4 w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resolveMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        처리 완료
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Action Logs */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                >
                  <History className="w-4 h-4" />
                  처리 이력
                </button>
                {showLogs && (
                  <div className="mt-4 space-y-3">
                    {logs && logs.length > 0 ? (
                      logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 text-sm border-l-2 border-gray-200 pl-3"
                        >
                          <div>
                            <p className="text-gray-700">
                              <span className="font-medium">{log.action}</span>
                              {log.old_value && log.new_value && (
                                <span className="text-gray-500">
                                  : {log.old_value} → {log.new_value}
                                </span>
                              )}
                            </p>
                            {log.note && <p className="text-gray-500 text-xs mt-1">{log.note}</p>}
                            <p className="text-gray-400 text-xs mt-1">
                              {log.admin?.name || '시스템'} ·{' '}
                              {new Date(log.created_at).toLocaleString('ko-KR')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">처리 이력이 없습니다</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
