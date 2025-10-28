import type { CardFilters as CardFiltersType } from '@/lib/api/cards'

interface CardFiltersProps {
  filters: CardFiltersType
  onChange: (key: keyof CardFiltersType, value: any) => void
}

export function CardFilters({ filters, onChange }: CardFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Theme Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">테마</label>
        <select
          value={filters.theme}
          onChange={(e) => onChange('theme', e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">모든 테마</option>
          <option value="trendy">Trendy</option>
          <option value="apple">Apple</option>
          <option value="professional">Professional</option>
          <option value="simple">Simple</option>
          <option value="default">Default</option>
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
        <select
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">모든 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
        <select
          value={filters.sort_by}
          onChange={(e) => onChange('sort_by', e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="created_at">생성일</option>
          <option value="view_count">조회수</option>
          <option value="name">이름</option>
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">정렬 순서</label>
        <select
          value={filters.sort_order}
          onChange={(e) => onChange('sort_order', e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="desc">내림차순</option>
          <option value="asc">오름차순</option>
        </select>
      </div>
    </div>
  )
}
