import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  User,
  CreditCard,
  ShoppingBag,
  Loader2,
} from 'lucide-react'
import { fetchReports, fetchReportStats, updateReportStatus } from '@/lib/api/reports'
import { ReportDetailModal } from '@/components/reports/ReportDetailModal'
import type { ReportWithDetails, ReportFilters, PaginationParams } from '@/types/admin'
import { useAuthStore } from '@/stores/authStore'

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

// 대상 타입 라벨
const TARGET_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  business_card: { label: '명함', icon: CreditCard },
  sidejob_card: { label: '부가명함', icon: ShoppingBag },
  user: { label: '사용자', icon: User },
}

export function ReportsPage() {
  const queryClient = useQueryClient()
  const { user: adminUser } = useAuthStore()
  const [selectedReport, setSelectedReport] = useState<ReportWithDetails | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [filters, setFilters] = useState<ReportFilters>({
    search: '',
    status: 'all',
    report_type: 'all',
    severity: 'all',
    target_type: 'all',
    sort_by: 'created_at',
    sort_order: 'desc',
  })
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    per_page: 20,
  })

  // Fetch reports
  const { data: reportsData, isLoading: isLoadingReports } = useQuery({
    queryKey: ['reports', filters, pagination],
    queryFn: () => fetchReports(filters, pagination),
  })

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['report-stats'],
    queryFn: fetchReportStats,
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'investigating' }) =>
      updateReportStatus(id, status, adminUser?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['report-stats'] })
    },
  })

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  // Open detail modal
  const handleViewReport = (report: ReportWithDetails) => {
    setSelectedReport(report)
    setIsDetailModalOpen(true)
  }

  // Start investigation
  const handleStartInvestigation = async (report: ReportWithDetails) => {
    if (report.status !== 'pending') return
    await updateStatusMutation.mutateAsync({ id: report.id, status: 'investigating' })
  }

  // Get target name
  const getTargetName = (report: ReportWithDetails) => {
    if (report.target_card) return report.target_card.name
    if (report.target_sidejob) return report.target_sidejob.title
    if (report.target_user) return report.target_user.name
    return '-'
  }

  // Get reporter display
  const getReporterDisplay = (report: ReportWithDetails) => {
    if (report.reporter?.email) return report.reporter.email
    if (report.reporter_email) return report.reporter_email
    return '익명'
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 rounded-lg">
            <Flag className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">신고 관리</h1>
        </div>
        <p className="text-gray-600">사용자 신고를 검토하고 처리합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">전체</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
            <Flag className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-yellow-200 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">대기</p>
              <p className="text-2xl font-bold text-yellow-800">{stats?.pending || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">검토중</p>
              <p className="text-2xl font-bold text-blue-800">{stats?.investigating || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">완료</p>
              <p className="text-2xl font-bold text-green-800">{stats?.resolved || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">기각</p>
              <p className="text-2xl font-bold text-gray-700">{stats?.rejected || 0}</p>
            </div>
            <XCircle className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow mb-6 p-6 border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="설명, 신고자 이메일 검색..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value as ReportFilters['status'] }))
            }
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">모든 상태</option>
            <option value="pending">대기</option>
            <option value="investigating">검토중</option>
            <option value="resolved">완료</option>
            <option value="rejected">기각</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.report_type}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                report_type: e.target.value as ReportFilters['report_type'],
              }))
            }
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">모든 유형</option>
            <option value="spam">스팸</option>
            <option value="inappropriate">부적절</option>
            <option value="fraud">사기</option>
            <option value="copyright">저작권</option>
            <option value="privacy">개인정보</option>
            <option value="other">기타</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filters.severity}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                severity: e.target.value as ReportFilters['severity'],
              }))
            }
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">모든 심각도</option>
            <option value="high">높음</option>
            <option value="medium">중간</option>
            <option value="low">낮음</option>
          </select>

          {/* Target Type Filter */}
          <select
            value={filters.target_type}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                target_type: e.target.value as ReportFilters['target_type'],
              }))
            }
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">모든 대상</option>
            <option value="business_card">명함</option>
            <option value="sidejob_card">부가명함</option>
            <option value="user">사용자</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        {isLoadingReports ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : reportsData?.data.length === 0 ? (
          <div className="text-center py-12">
            <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">신고 내역이 없습니다</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      상태
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      대상
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      유형
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      심각도
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      신고자
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      접수일
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      조치
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportsData?.data.map((report) => {
                    const statusInfo = STATUS_LABELS[report.status]
                    const StatusIcon = statusInfo.icon
                    const severityInfo = SEVERITY_LABELS[report.severity]
                    const targetInfo = TARGET_TYPE_LABELS[report.target_type]
                    const TargetIcon = targetInfo.icon

                    return (
                      <tr key={report.id} className="hover:bg-gray-50 transition">
                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusInfo.label}
                          </span>
                        </td>

                        {/* Target */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gray-100 rounded">
                              <TargetIcon className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{getTargetName(report)}</p>
                              <p className="text-xs text-gray-500">{targetInfo.label}</p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {REPORT_TYPE_LABELS[report.report_type]}
                          </span>
                        </td>

                        {/* Severity */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${severityInfo.color}`}
                          >
                            {severityInfo.label}
                          </span>
                        </td>

                        {/* Reporter */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{getReporterDisplay(report)}</span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {new Date(report.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewReport(report)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition"
                              title="상세 보기"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            {report.status === 'pending' && (
                              <button
                                onClick={() => handleStartInvestigation(report)}
                                disabled={updateStatusMutation.isPending}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                              >
                                검토 시작
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                총 {reportsData?.total || 0}건 중 {(pagination.page - 1) * pagination.per_page + 1}-
                {Math.min(pagination.page * pagination.per_page, reportsData?.total || 0)}건
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  {pagination.page} / {reportsData?.total_pages || 1}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= (reportsData?.total_pages || 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedReport(null)
          }}
        />
      )}
    </div>
  )
}
