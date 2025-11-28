import { useState } from 'react'
import { CreditCard, Search, Download, Grid3x3, List, CheckSquare, Plus } from 'lucide-react'
import { useCards } from '@/hooks/useCards'
import { CardsGridView } from '@/components/cards/CardsGridView'
import { CardsTableView } from '@/components/cards/CardsTableView'
import { CardFilters } from '@/components/cards/CardFilters'
import { BulkActionsBar } from '@/components/cards/BulkActionsBar'
import { CardEditModal } from '@/components/cards/CardEditModal'
import { CardCreateModal } from '@/components/cards/CardCreateModal'
import { fetchCard, deleteCard } from '@/lib/api/cards'
import type { CardFilters as CardFiltersType, PaginationParams } from '@/lib/api/cards'
import type { CardWithStats } from '@/types/admin'

type ViewMode = 'grid' | 'table'

export function CardsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [editingCard, setEditingCard] = useState<CardWithStats | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filters, setFilters] = useState<CardFiltersType>({
    search: '',
    theme: 'all',
    status: 'all',
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    per_page: 50,
  })

  const { data, isLoading, error, refetch } = useCards(filters, pagination)

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof CardFiltersType, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleSelectCard = (cardId: string) => {
    setSelectedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedCards.size === data?.data.length) {
      setSelectedCards(new Set())
    } else {
      setSelectedCards(new Set(data?.data.map((card) => card.id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedCards(new Set())
  }

  const handleEdit = async (cardId: string) => {
    try {
      const card = await fetchCard(cardId)
      // Convert CardWithUser to CardWithStats
      setEditingCard(card ? {
        ...card,
        view_count: card.view_count || 0,
        qr_scan_count: card.qr_scan_count || 0,
        sidejob_count: card.sidejob_count || 0,
      } as any : null)
      setIsEditModalOpen(true)
    } catch (error) {
      console.error('Failed to fetch card:', error)
      alert('명함 정보를 불러오는데 실패했습니다')
    }
  }

  const handleDelete = async (cardId: string) => {
    if (!confirm('정말 이 명함을 삭제하시겠습니까?')) {
      return
    }

    try {
      await deleteCard(cardId)
      alert('명함이 삭제되었습니다')
      refetch()
    } catch (error) {
      console.error('Failed to delete card:', error)
      alert('명함 삭제에 실패했습니다')
    }
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false)
    setEditingCard(null)
    refetch()
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
              명함 관리
            </h1>
            <p className="text-gray-600 mt-2">전체 명함 목록을 확인하고 관리할 수 있습니다</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <Download className="w-4 h-4" />
              CSV 다운로드
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              새 명함 생성
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 명함</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.total.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">활성 명함</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.data.filter((c) => c.is_active).length.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 조회수</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.data
                  .reduce((sum, c) => sum + (c.view_count || 0), 0)
                  .toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👁️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 QR 스캔</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.data
                  .reduce((sum, c) => sum + (c.qr_scan_count || 0), 0)
                  .toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="bg-white rounded-xl shadow mb-6 p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="명함 제목, 회사명 검색..."
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
        <CardFilters filters={filters} onChange={handleFilterChange} />
      </div>

      {/* Bulk Actions Bar */}
      {selectedCards.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedCards.size}
          selectedCards={Array.from(selectedCards)}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Cards Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow p-8 border border-gray-100">
          <p className="text-red-600 text-center">명함 목록을 불러오는 중 오류가 발생했습니다</p>
          <p className="text-gray-500 text-sm text-center mt-2">{error.message}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <CardsGridView
          cards={data?.data || []}
          selectedCards={selectedCards}
          onSelectCard={handleSelectCard}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <CardsTableView
          cards={data?.data || []}
          selectedCards={selectedCards}
          onSelectCard={handleSelectCard}
          onSelectAll={handleSelectAll}
        />
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

      {/* Edit Modal */}
      {editingCard && (
        <CardEditModal
          card={editingCard}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingCard(null)
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Create Modal */}
      <CardCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          refetch()
        }}
      />
    </div>
  )
}
