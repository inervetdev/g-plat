// Template Filters Panel Component
// 템플릿 필터 패널 컴포넌트

import { CATEGORY_LABELS } from '@/types/sidejob'
import type { TemplateFilters, AdminB2BCategory } from '@/types/sidejob'

interface TemplateFiltersPanelProps {
  filters: TemplateFilters
  onChange: (key: keyof TemplateFilters, value: any) => void
}

export function TemplateFiltersPanel({ filters, onChange }: TemplateFiltersPanelProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
        <select
          value={filters.category || 'all'}
          onChange={(e) => onChange('category', e.target.value as AdminB2BCategory | 'all')}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
        <select
          value={filters.is_active === 'all' ? 'all' : filters.is_active ? 'active' : 'inactive'}
          onChange={(e) => {
            const val = e.target.value
            onChange('is_active', val === 'all' ? 'all' : val === 'active')
          }}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
      </div>

      {/* Sort By Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">정렬</label>
        <select
          value={filters.sort_by || 'display_priority'}
          onChange={(e) => onChange('sort_by', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="display_priority">우선순위</option>
          <option value="created_at">생성일</option>
          <option value="total_clicks">클릭수</option>
          <option value="total_conversions">전환수</option>
        </select>
      </div>

      {/* Sort Order Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
        <select
          value={filters.sort_order || 'desc'}
          onChange={(e) => onChange('sort_order', e.target.value as 'asc' | 'desc')}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="desc">내림차순</option>
          <option value="asc">오름차순</option>
        </select>
      </div>
    </div>
  )
}
