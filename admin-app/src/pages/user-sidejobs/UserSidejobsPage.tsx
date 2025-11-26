/**
 * 사용자 부가명함 관리 페이지
 */

import { useState } from 'react'
import {
  LayoutGrid,
  List,
  Package,
  CheckCircle,
  Eye,
  MousePointerClick,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  useUserSidejobs,
  useUserSidejobStats,
  useToggleUserSidejobActive,
  useDeleteUserSidejob,
} from '@/hooks/useUserSidejobs'
import {
  UserSidejobCard,
  UserSidejobTableView,
  UserSidejobFiltersPanel,
  UserSidejobEditModal,
} from '@/components/user-sidejobs'
import type {
  UserSidejobCard as UserSidejobCardType,
  UserSidejobFilters,
  PaginationParams,
} from '@/types/userSidejob'
import { CATEGORY_CONFIG } from '@/types/userSidejob'

export default function UserSidejobsPage() {
  // 상태
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [filters, setFilters] = useState<UserSidejobFilters>({
    sort_by: 'created_at',
    sort_order: 'desc',
  })
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    per_page: 20,
  })
  const [editingCard, setEditingCard] = useState<UserSidejobCardType | null>(null)

  // 데이터 조회
  const { data: cardsData, isLoading, refetch } = useUserSidejobs(filters, pagination)
  const { data: stats } = useUserSidejobStats()

  // 뮤테이션
  const toggleActiveMutation = useToggleUserSidejobActive()
  const deleteMutation = useDeleteUserSidejob()

  // 핸들러
  const handleFiltersChange = (newFilters: UserSidejobFilters) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 })) // 필터 변경 시 1페이지로
  }

  const handleEdit = (card: UserSidejobCardType) => {
    setEditingCard(card)
  }

  const handleToggleActive = async (card: UserSidejobCardType) => {
    try {
      await toggleActiveMutation.mutateAsync({
        id: card.id,
        isActive: !card.is_active,
      })
    } catch (error) {
      console.error('Toggle active error:', error)
    }
  }

  const handleDelete = async (card: UserSidejobCardType) => {
    if (!confirm(`"${card.title}" 부가명함을 삭제하시겠습니까?`)) {
      return
    }
    try {
      await deleteMutation.mutateAsync(card.id)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleSuccess = () => {
    refetch()
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">부가명함 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            사용자가 생성한 부가명함을 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg ${
              viewMode === 'table'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="전체 부가명함"
            value={stats.total}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="활성"
            value={stats.active}
            color="green"
          />
          <StatCard
            icon={<Eye className="w-5 h-5" />}
            label="총 조회수"
            value={stats.total_views}
            color="purple"
          />
          <StatCard
            icon={<MousePointerClick className="w-5 h-5" />}
            label="총 클릭수"
            value={stats.total_clicks}
            color="orange"
          />
        </div>
      )}

      {/* 카테고리별 현황 */}
      {stats && stats.by_category.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">카테고리별 현황</h3>
          <div className="flex flex-wrap gap-2">
            {stats.by_category.map((cat) => {
              const config = CATEGORY_CONFIG[cat.category]
              if (!config || cat.count === 0) return null
              return (
                <div
                  key={cat.category}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: `${config.color}10` }}
                >
                  <span>{config.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: config.color }}>
                    {config.label}
                  </span>
                  <span className="text-sm text-gray-600">{cat.count}개</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 필터 */}
      <UserSidejobFiltersPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* 콘텐츠 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cardsData?.data.map((card) => (
            <UserSidejobCard
              key={card.id}
              card={card}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      ) : (
        <UserSidejobTableView
          cards={cardsData?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* 빈 상태 */}
      {!isLoading && cardsData?.data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>부가명함이 없습니다.</p>
        </div>
      )}

      {/* 페이지네이션 */}
      {cardsData && cardsData.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            총 {cardsData.total.toLocaleString()}개 중 {(pagination.page - 1) * pagination.per_page + 1}-
            {Math.min(pagination.page * pagination.per_page, cardsData.total)}개 표시
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              {pagination.page} / {cardsData.total_pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= cardsData.total_pages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 편집 모달 */}
      {editingCard && (
        <UserSidejobEditModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}

// 통계 카드 컴포넌트
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-semibold text-gray-900">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
