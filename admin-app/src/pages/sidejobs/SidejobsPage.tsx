// Admin Sidejob Templates Page
// 제휴 부가명함 템플릿 관리 페이지

import { useState } from 'react'
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  Grid3x3,
  List,
  MousePointerClick,
  TrendingUp,
  Users,
  Target,
} from 'lucide-react'
import { useTemplates, useTemplateStats } from '@/hooks/useSidejobs'
import { TemplateCard } from '@/components/sidejobs/TemplateCard'
import { TemplateTableView } from '@/components/sidejobs/TemplateTableView'
import { TemplateFiltersPanel } from '@/components/sidejobs/TemplateFiltersPanel'
import { TemplateCreateModal } from '@/components/sidejobs/TemplateCreateModal'
import { TemplateEditModal } from '@/components/sidejobs/TemplateEditModal'
import { InstancesModal } from '@/components/sidejobs/InstancesModal'
import { CATEGORY_LABELS } from '@/types/sidejob'
import type { TemplateFilters, PaginationParams, AdminSidejobTemplate, AdminB2BCategory } from '@/types/sidejob'

type ViewMode = 'grid' | 'table'

export function SidejobsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AdminSidejobTemplate | null>(null)
  const [instancesTemplate, setInstancesTemplate] = useState<AdminSidejobTemplate | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<TemplateFilters>({
    search: '',
    category: 'all',
    is_active: 'all',
    sort_by: 'display_priority',
    sort_order: 'desc',
  })

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    per_page: 20,
  })

  const { data, isLoading, error, refetch } = useTemplates(filters, pagination)
  const { data: stats, isLoading: statsLoading } = useTemplateStats()

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof TemplateFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleEdit = (template: AdminSidejobTemplate) => {
    setEditingTemplate(template)
  }

  const handleViewInstances = (template: AdminSidejobTemplate) => {
    setInstancesTemplate(template)
  }

  const handleSuccess = () => {
    setIsCreateModalOpen(false)
    setEditingTemplate(null)
    refetch()
  }

  // Group templates by category
  const templatesByCategory = data?.data.reduce((acc, template) => {
    const category = template.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(template)
    return acc
  }, {} as Record<AdminB2BCategory, AdminSidejobTemplate[]>)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              제휴 부가명함 관리
            </h1>
            <p className="text-gray-600 mt-2">
              제휴 파트너 부가명함 템플릿을 관리하고 사용자에게 할당합니다
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            템플릿 추가
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 템플릿</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statsLoading ? '-' : stats?.total_templates.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                활성: {statsLoading ? '-' : stats?.active_templates || 0}개
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 할당</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statsLoading ? '-' : stats?.total_instances.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 클릭</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statsLoading ? '-' : stats?.total_clicks.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MousePointerClick className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">예상 수익</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statsLoading ? '-' : `${(stats?.total_expected_revenue || 0).toLocaleString()}원`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                전환: {statsLoading ? '-' : stats?.total_conversions || 0}건
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      {stats?.by_category && stats.by_category.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-600" />
            카테고리별 현황
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stats.by_category.map((item) => (
              <div
                key={item.category}
                className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleFilterChange('category', item.category)}
              >
                <p className="text-sm font-medium text-gray-900">
                  {CATEGORY_LABELS[item.category] || item.category}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {item.count}개 템플릿 · {item.clicks.toLocaleString()} 클릭
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow mb-6 p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="템플릿명, 파트너사 검색..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
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

        {/* Expanded Filters */}
        {showFilters && (
          <TemplateFiltersPanel filters={filters} onChange={handleFilterChange} />
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow p-8 border border-gray-100">
          <p className="text-red-600 text-center">템플릿 목록을 불러오는 중 오류가 발생했습니다</p>
          <p className="text-gray-500 text-sm text-center mt-2">{error.message}</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid view - grouped by category if no category filter
        filters.category === 'all' && templatesByCategory ? (
          <div className="space-y-8">
            {Object.entries(templatesByCategory).map(([category, templates]) => (
              <div key={category} className="bg-white rounded-xl shadow border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  {CATEGORY_LABELS[category as AdminB2BCategory] || category}
                  <span className="text-sm text-gray-500 font-normal">
                    ({templates.length}개)
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={() => handleEdit(template)}
                      onViewInstances={() => handleViewInstances(template)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Simple grid when category filtered
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => handleEdit(template)}
                onViewInstances={() => handleViewInstances(template)}
              />
            ))}
          </div>
        )
      ) : (
        <TemplateTableView
          templates={data?.data || []}
          onEdit={handleEdit}
          onViewInstances={handleViewInstances}
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && data?.data.length === 0 && (
        <div className="bg-white rounded-xl shadow p-12 border border-gray-100 text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">템플릿이 없습니다</h3>
          <p className="text-gray-600 mb-6">
            제휴 파트너 부가명함 템플릿을 추가해주세요
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            첫 템플릿 추가
          </button>
        </div>
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="text-sm text-gray-600">
            전체 {data.total.toLocaleString()}개 중{' '}
            {((pagination.page - 1) * pagination.per_page + 1).toLocaleString()}-
            {Math.min(pagination.page * pagination.per_page, data.total).toLocaleString()}개 표시
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
              {pagination.page} / {data.total_pages}
            </span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= data.total_pages}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <TemplateCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {editingTemplate && (
        <TemplateEditModal
          template={editingTemplate}
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSuccess={handleSuccess}
        />
      )}

      {instancesTemplate && (
        <InstancesModal
          template={instancesTemplate}
          isOpen={!!instancesTemplate}
          onClose={() => setInstancesTemplate(null)}
        />
      )}
    </div>
  )
}
