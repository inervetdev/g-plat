import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users as UsersIcon, Search, Download, TrendingUp, UserPlus, ChevronDown, Star, Crown, Zap } from 'lucide-react'
import { useUsers, useUserStats, useUpdateUser } from '@/hooks/useUsers'
import { UserCreateModal } from '@/components/users/UserCreateModal'
import type { UserFilters, PaginationParams, UserWithStats } from '@/types/admin'

// 빠른 등급 변경 드롭다운 컴포넌트
function TierDropdown({
  user,
  onTierChange,
  isUpdating
}: {
  user: UserWithStats
  onTierChange: (userId: string, tier: 'FREE' | 'PREMIUM' | 'BUSINESS', grandfathered?: boolean) => void
  isUpdating: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  const tiers = [
    { value: 'FREE', label: '무료', icon: null, color: 'bg-gray-100 text-gray-700' },
    { value: 'PREMIUM', label: '프리미엄', icon: Zap, color: 'bg-blue-100 text-blue-700' },
    { value: 'BUSINESS', label: '비즈니스', icon: Crown, color: 'bg-purple-100 text-purple-700' },
  ]

  const currentTier = tiers.find(t => t.value === user.subscription_tier) || tiers[0]
  const TierIcon = currentTier.icon

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${currentTier.color} hover:opacity-80 transition disabled:opacity-50`}
      >
        {TierIcon && <TierIcon className="w-3 h-3" />}
        {currentTier.label}
        {user.grandfathered && <Star className="w-3 h-3 text-amber-500" />}
        <ChevronDown className={`w-3 h-3 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">등급 변경</div>
            {tiers.map((tier) => {
              const Icon = tier.icon
              return (
                <button
                  key={tier.value}
                  onClick={() => {
                    onTierChange(user.id, tier.value as 'FREE' | 'PREMIUM' | 'BUSINESS')
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                    user.subscription_tier === tier.value ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {!Icon && <span className="w-4" />}
                  {tier.label}
                  {user.subscription_tier === tier.value && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </button>
              )
            })}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => {
                  onTierChange(user.id, user.subscription_tier, !user.grandfathered)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
              >
                <Star className={`w-4 h-4 ${user.grandfathered ? 'text-amber-500' : 'text-gray-300'}`} />
                얼리어답터 {user.grandfathered ? '해제' : '설정'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function UsersPage() {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    subscription_tier: 'all',
    status: 'all',
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    per_page: 50,
  })

  const { data, isLoading, error, refetch } = useUsers(filters, pagination)
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useUserStats()
  const updateUserMutation = useUpdateUser()

  // 등급 변경 핸들러
  const handleTierChange = async (userId: string, tier: 'FREE' | 'PREMIUM' | 'BUSINESS', grandfathered?: boolean) => {
    setUpdatingUserId(userId)
    try {
      const updateData: Record<string, any> = { subscription_tier: tier }
      if (grandfathered !== undefined) {
        updateData.grandfathered = grandfathered
      }
      await updateUserMutation.mutateAsync({ userId, data: updateData })
      refetch()
      refetchStats()
    } catch (error) {
      console.error('Failed to update tier:', error)
      alert('등급 변경에 실패했습니다')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UsersIcon className="w-8 h-8 text-blue-600" />
              사용자 관리
            </h1>
            <p className="text-gray-600 mt-2">
              전체 사용자 목록을 확인하고 관리할 수 있습니다
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              신규 사용자 추가
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              <Download className="w-4 h-4" />
              CSV 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 사용자</p>
              {statsLoading ? (
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.total.toLocaleString() || '0'}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">활성 사용자</p>
              {statsLoading ? (
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.active.toLocaleString() || '0'}
                  </p>
                  {stats && stats.total > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {((stats.active / stats.total) * 100).toFixed(1)}%
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Premium Users */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">유료 구독 사용자</p>
              {statsLoading ? (
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {((stats?.premium || 0) + (stats?.business || 0)).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Premium: {stats?.premium || 0} · Business: {stats?.business || 0}
                  </p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Today Signups */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">오늘 가입</p>
              {statsLoading ? (
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.today_signups.toLocaleString() || '0'}
                  </p>
                  {stats && stats.today_signups > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <p className="text-xs text-green-600 font-medium">신규 가입</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow mb-6 p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="이름, 이메일 검색..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Subscription Filter */}
          <div>
            <select
              value={filters.subscription_tier}
              onChange={(e) => handleFilterChange('subscription_tier', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 구독 등급</option>
              <option value="FREE">무료</option>
              <option value="PREMIUM">프리미엄</option>
              <option value="BUSINESS">비즈니스</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="suspended">정지</option>
              <option value="deleted">삭제대기</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow border border-gray-100">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 font-medium">데이터를 불러오는 중 오류가 발생했습니다</p>
              <p className="text-gray-500 text-sm mt-2">{error.message}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    구독 등급
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    명함 수
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <TierDropdown
                        user={user}
                        onTierChange={handleTierChange}
                        isUpdating={updatingUserId === user.id}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-900">{user.card_count || 0}</td>
                    <td className="px-6 py-4">
                      {/* 삭제 대상이면 "삭제대기"만 표시 */}
                      {user.deleted_at ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          삭제대기
                        </span>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : user.status === 'suspended'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.status === 'active'
                            ? '활성'
                            : user.status === 'suspended'
                            ? '정지'
                            : '비활성'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => navigate(`/users/${user.id}`)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  전체 {data.total.toLocaleString()}명 중 {((pagination.page - 1) * pagination.per_page) + 1}-
                  {Math.min(pagination.page * pagination.per_page, data.total)}명 표시
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    이전
                  </button>
                  <span className="text-sm text-gray-600">
                    {pagination.page} / {data.total_pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= data.total_pages}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          refetch()
          refetchStats()
        }}
      />
    </div>
  )
}
