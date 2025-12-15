import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  QrCode,
  Search,
  Grid3x3,
  List,
  Eye,
  ToggleLeft,
  ToggleRight,
  Trash2,
  BarChart3,
  Download,
  Calendar,
  X,
  User,
  ExternalLink,
} from 'lucide-react'
import { fetchQRCodes, fetchQROverviewStats, toggleQRCodeActive, deleteQRCode } from '@/lib/api/qr'
import { QrDetailModal } from '@/components/qr/QrDetailModal'
import type { QRCodeWithDetails, QRFilters, PaginationParams } from '@/types/admin'

type ViewMode = 'grid' | 'table'

export function QrCodesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedQR, setSelectedQR] = useState<QRCodeWithDetails | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [qrPopup, setQrPopup] = useState<{ isOpen: boolean; qr: QRCodeWithDetails | null }>({
    isOpen: false,
    qr: null,
  })
  const [filters, setFilters] = useState<QRFilters>({
    search: '',
    status: 'all',
    sort_by: 'created_at',
    sort_order: 'desc',
  })
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    per_page: 50,
  })

  // Fetch QR codes
  const {
    data: qrData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['qr-codes', filters, pagination],
    queryFn: () => fetchQRCodes(filters, pagination),
  })

  // Fetch overview stats
  const { data: stats } = useQuery({
    queryKey: ['qr-overview-stats'],
    queryFn: fetchQROverviewStats,
  })

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof QRFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleToggleActive = async (qr: QRCodeWithDetails) => {
    try {
      await toggleQRCodeActive(qr.id, !qr.is_active)
      refetch()
    } catch (error) {
      console.error('Failed to toggle QR code:', error)
      alert('QR 코드 상태 변경에 실패했습니다')
    }
  }

  const handleDelete = async (qr: QRCodeWithDetails) => {
    if (!confirm(`정말 이 QR 코드(${qr.short_code})를 삭제하시겠습니까?\n관련된 모든 스캔 기록도 삭제됩니다.`)) {
      return
    }

    try {
      await deleteQRCode(qr.id)
      alert('QR 코드가 삭제되었습니다')
      refetch()
    } catch (error) {
      console.error('Failed to delete QR code:', error)
      alert('QR 코드 삭제에 실패했습니다')
    }
  }

  const handleViewDetails = (qr: QRCodeWithDetails) => {
    setSelectedQR(qr)
    setIsDetailModalOpen(true)
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <QrCode className="w-8 h-8 text-blue-600" />
              QR 코드 관리
            </h1>
            <p className="text-gray-600 mt-2">전체 QR 코드 목록을 확인하고 스캔 통계를 분석할 수 있습니다</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <Download className="w-4 h-4" />
              CSV 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 QR 코드</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalQRCodes.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">활성 QR 코드</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.activeQRCodes.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ToggleRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 스캔 수</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalScans.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">오늘 스캔</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.scansToday.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">이번 주 스캔</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.scansThisWeek.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow mb-6 p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="이름, 회사, Short code 검색..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="expired">만료됨</option>
          </select>

          <select
            value={filters.sort_by || 'created_at'}
            onChange={(e) => handleFilterChange('sort_by', e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">생성일순</option>
            <option value="scan_count">스캔수순</option>
            <option value="updated_at">수정일순</option>
          </select>

          <select
            value={filters.sort_order || 'desc'}
            onChange={(e) => handleFilterChange('sort_order', e.target.value as 'asc' | 'desc')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow p-8 border border-gray-100">
          <p className="text-red-600 text-center">QR 코드 목록을 불러오는 중 오류가 발생했습니다</p>
          <p className="text-gray-500 text-sm text-center mt-2">{(error as Error).message}</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {qrData?.data.map((qr) => (
            <div
              key={qr.id}
              className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition"
            >
              {/* QR Image Area - Clickable */}
              <div
                className="p-6 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition"
                onClick={() => setQrPopup({ isOpen: true, qr })}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://g-plat.com/q/${qr.short_code}`)}`}
                  alt={`QR: ${qr.short_code}`}
                  className="w-24 h-24 rounded-lg bg-white p-1"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 truncate">{qr.business_card?.name || '-'}</p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                      isExpired(qr.expires_at)
                        ? 'bg-red-100 text-red-700'
                        : qr.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isExpired(qr.expires_at) ? '만료됨' : qr.is_active ? '활성' : '비활성'}
                  </span>
                </div>

                <p className="text-xs text-gray-400">g-plat.com/q/{qr.short_code}</p>

                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {qr.scan_count}회 스캔
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewDetails(qr)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm flex items-center justify-center gap-1"
                  >
                    <BarChart3 className="w-4 h-4" />
                    분석
                  </button>
                  <button
                    onClick={() => handleToggleActive(qr)}
                    className={`p-2 rounded-lg transition ${
                      qr.is_active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={qr.is_active ? '비활성화' : '활성화'}
                  >
                    {qr.is_active ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Table View
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    QR 코드
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    연결된 명함
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    스캔 수
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {qrData?.data.map((qr) => (
                  <tr key={qr.id} className="hover:bg-gray-50 transition">
                    {/* QR Code - Clickable */}
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setQrPopup({ isOpen: true, qr })}
                      >
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=48x48&data=${encodeURIComponent(`https://g-plat.com/q/${qr.short_code}`)}`}
                          alt={`QR: ${qr.short_code}`}
                          className="w-12 h-12 rounded-lg hover:opacity-80 transition"
                        />
                        <p className="text-xs text-gray-400">
                          g-plat.com/q/{qr.short_code}
                        </p>
                      </div>
                    </td>

                    {/* Business Card */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{qr.business_card?.name || '-'}</p>
                      {qr.business_card?.company && (
                        <p className="text-xs text-gray-500 mt-0.5">{qr.business_card.company}</p>
                      )}
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {qr.business_card?.user_id ? qr.business_card.user_id.slice(0, 8) + '...' : '-'}
                        </span>
                      </div>
                    </td>

                    {/* Scan Count */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{qr.scan_count}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          isExpired(qr.expires_at)
                            ? 'bg-red-100 text-red-700'
                            : qr.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {isExpired(qr.expires_at) ? '만료됨' : qr.is_active ? '활성' : '비활성'}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(qr.created_at).toLocaleDateString('ko-KR')}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewDetails(qr)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="상세 통계"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(qr)}
                          className={`p-2 rounded-lg transition ${
                            qr.is_active
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={qr.is_active ? '비활성화' : '활성화'}
                        >
                          {qr.is_active ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(qr)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {(!qrData?.data || qrData.data.length === 0) && (
            <div className="py-20 text-center">
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">QR 코드가 없습니다</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {qrData && qrData.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="text-sm text-gray-600">
            전체 {qrData.total.toLocaleString()}개 중{' '}
            {((pagination.page - 1) * pagination.per_page + 1).toLocaleString()}-
            {Math.min(pagination.page * pagination.per_page, qrData.total).toLocaleString()}개 표시
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              이전
            </button>
            <span className="text-sm text-gray-600">
              {pagination.page} / {qrData.total_pages}
            </span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= qrData.total_pages}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedQR && (
        <QrDetailModal
          qrCode={selectedQR}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedQR(null)
          }}
        />
      )}

      {/* QR Code Popup Modal */}
      {qrPopup.isOpen && qrPopup.qr && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => setQrPopup({ isOpen: false, qr: null })}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">QR 코드</h3>
              <button
                onClick={() => setQrPopup({ isOpen: false, qr: null })}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://g-plat.com/q/${qrPopup.qr.short_code}`)}`}
                alt={`QR: ${qrPopup.qr.short_code}`}
                className="w-48 h-48 rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-600 text-center">
                {qrPopup.qr.business_card?.name || '명함'}
              </p>
              <p className="mt-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                https://g-plat.com/q/{qrPopup.qr.short_code}
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <a
                href={`https://g-plat.com/q/${qrPopup.qr.short_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center text-sm flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                링크 열기
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://g-plat.com/q/${qrPopup.qr?.short_code}`)
                  alert('링크가 복사되었습니다!')
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center text-sm"
              >
                링크 복사
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
