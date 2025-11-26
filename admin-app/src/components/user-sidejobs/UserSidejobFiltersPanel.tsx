/**
 * 사용자 부가명함 필터 패널
 */

import { Search } from 'lucide-react'
import type { UserSidejobFilters, CategoryPrimary } from '@/types/userSidejob'
import { CATEGORY_CONFIG } from '@/types/userSidejob'

interface UserSidejobFiltersPanelProps {
  filters: UserSidejobFilters
  onFiltersChange: (filters: UserSidejobFilters) => void
}

export function UserSidejobFiltersPanel({
  filters,
  onFiltersChange,
}: UserSidejobFiltersPanelProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CategoryPrimary | 'all'
    onFiltersChange({ ...filters, category: value })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    let isActive: boolean | 'all' = 'all'
    if (value === 'active') isActive = true
    if (value === 'inactive') isActive = false
    onFiltersChange({ ...filters, is_active: isActive })
  }

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sort_by: e.target.value as UserSidejobFilters['sort_by'],
    })
  }

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sort_order: e.target.value as 'asc' | 'desc',
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 검색 */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            검색
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="제목, 설명으로 검색..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <select
            value={filters.category || 'all'}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">전체 카테고리</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.emoji} {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상태
          </label>
          <select
            value={
              filters.is_active === true
                ? 'active'
                : filters.is_active === false
                ? 'inactive'
                : 'all'
            }
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>

        {/* 정렬 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            정렬
          </label>
          <div className="flex gap-2">
            <select
              value={filters.sort_by || 'created_at'}
              onChange={handleSortByChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at">생성일</option>
              <option value="view_count">조회수</option>
              <option value="click_count">클릭수</option>
              <option value="title">제목</option>
            </select>
            <select
              value={filters.sort_order || 'desc'}
              onChange={handleSortOrderChange}
              className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">↓</option>
              <option value="asc">↑</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
