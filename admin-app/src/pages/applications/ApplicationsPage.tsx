import { useState, useCallback } from 'react'
import {
  Search,
  Eye,
  Clock,
  CheckCircle,
  UserCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ClipboardList,
  UserPlus,
} from 'lucide-react'
import {
  useApplications,
  useApplicationStats,
  useAdminUsers,
  useTemplatesForFilter,
  useAssignApplication,
} from '@/hooks/useApplications'
import { ApplicationDetailModal } from '@/components/applications/ApplicationDetailModal'
import type {
  ProductApplicationWithRelations,
  ApplicationFilters,
  ApplicationStatus,
  PaginationParams,
} from '@/types/application'
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from '@/types/application'

export function ApplicationsPage() {
  const [selectedApplication, setSelectedApplication] = useState<ProductApplicationWithRelations | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [filters, setFilters] = useState<ApplicationFilters>({
    search: '',
    status: 'all',
    template_id: undefined,
    assigned_to: 'all',
    sort_by: 'created_at',
    sort_order: 'desc',
  })
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    per_page: 20,
  })

  // Queries
  const { data: applicationsData, isLoading } = useApplications(filters, pagination)
  const { data: stats } = useApplicationStats()
  const { data: adminUsers } = useAdminUsers()
  const { data: templates } = useTemplatesForFilter()

  // Mutations
  const assignMutation = useAssignApplication()

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handleFilterChange = useCallback((key: keyof ApplicationFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handleViewApplication = (application: ProductApplicationWithRelations) => {
    setSelectedApplication(application)
    setIsDetailModalOpen(true)
  }

  const handleQuickAssign = async (application: ProductApplicationWithRelations, assigneeId: string) => {
    await assignMutation.mutateAsync({
      id: application.id,
      input: { assigned_to: assigneeId },
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Status badge
  const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
    const colors = APPLICATION_STATUS_COLORS[status]
    const label = APPLICATION_STATUS_LABELS[status]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
        {label}
      </span>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ClipboardList className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">상품 신청 관리</h1>
        </div>
        <p className="text-gray-600">상품 신청을 검토하고 처리합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">전체</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">대기중</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">배정됨</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.assigned || 0}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">처리중</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.processing || 0}</p>
            </div>
            <Loader2 className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">완료</p>
              <p className="text-2xl font-bold text-green-600">{stats?.completed || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">오늘</p>
              <p className="text-2xl font-bold text-indigo-600">{stats?.today || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 이메일, 연락처로 검색..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="pending">대기중</option>
            <option value="assigned">배정됨</option>
            <option value="processing">처리중</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
          </select>

          {/* Template Filter */}
          <select
            value={filters.template_id || ''}
            onChange={(e) => handleFilterChange('template_id', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 상품</option>
            {templates?.map((template) => (
              <option key={template.id} value={template.id}>
                {template.title}
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={filters.assigned_to || 'all'}
            onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 담당자</option>
            <option value="unassigned">미배정</option>
            {adminUsers?.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상품
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      신청자
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      추천인
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      담당자
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      신청일
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applicationsData?.data.map((application) => (
                    <tr
                      key={application.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewApplication(application)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={application.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {application.template?.image_url ? (
                            <img
                              src={application.template.image_url}
                              alt={application.template.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {application.template?.title || '알 수 없음'}
                            </p>
                            {application.template?.partner_name && (
                              <p className="text-xs text-gray-500">
                                {application.template.partner_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{application.applicant_name}</p>
                          <p className="text-xs text-gray-500">{application.applicant_email}</p>
                          <p className="text-xs text-gray-500">{application.applicant_phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {application.referrer ? (
                          <div>
                            <p className="text-sm text-gray-900">
                              {application.referrer.name || application.referrer.email}
                            </p>
                            {application.referrer_card_url && (
                              <p className="text-xs text-blue-600">
                                /{application.referrer_card_url}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {application.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {application.assignee.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900">{application.assignee.name}</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Quick assign to first available admin
                              if (adminUsers && adminUsers.length > 0) {
                                handleQuickAssign(application, adminUsers[0].id)
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <UserPlus className="w-3 h-3" />
                            배정하기
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {formatDate(application.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewApplication(application)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {(!applicationsData?.data || applicationsData.data.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        신청 내역이 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {applicationsData && applicationsData.total_pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  총 {applicationsData.total}건 중 {(pagination.page - 1) * pagination.per_page + 1}-
                  {Math.min(pagination.page * pagination.per_page, applicationsData.total)}건
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    {pagination.page} / {applicationsData.total_pages}
                  </span>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= applicationsData.total_pages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedApplication(null)
          }}
        />
      )}
    </div>
  )
}

export default ApplicationsPage
