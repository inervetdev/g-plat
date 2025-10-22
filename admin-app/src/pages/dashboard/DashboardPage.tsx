import { useAuthStore } from '@/stores/authStore'
import { Users, UserCheck, CreditCard, DollarSign } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { SignupTrendChart } from '@/components/dashboard/SignupTrendChart'
import { SubscriptionChart } from '@/components/dashboard/SubscriptionChart'

// Mock data - 실제로는 API에서 가져옴
const mockStats = {
  totalUsers: 1248,
  activeUsers: 892,
  totalCards: 3456,
  revenue: 12450000,
  changes: {
    users: { value: 12.5, isPositive: true },
    activeUsers: { value: 8.3, isPositive: true },
    cards: { value: 15.2, isPositive: true },
    revenue: { value: 23.1, isPositive: true },
  },
}

const mockSignupData = [
  { date: '10/15', count: 45 },
  { date: '10/16', count: 52 },
  { date: '10/17', count: 48 },
  { date: '10/18', count: 61 },
  { date: '10/19', count: 55 },
  { date: '10/20', count: 67 },
  { date: '10/21', count: 72 },
]

const mockSubscriptionData = [
  { tier: 'FREE' as const, count: 980, percentage: 78.5 },
  { tier: 'PREMIUM' as const, count: 218, percentage: 17.5 },
  { tier: 'BUSINESS' as const, count: 50, percentage: 4.0 },
]

const mockRecentUsers = [
  { id: 1, name: '김철수', email: 'kim@example.com', joinedAt: '2025-10-21', tier: 'PREMIUM' as const },
  { id: 2, name: '이영희', email: 'lee@example.com', joinedAt: '2025-10-21', tier: 'FREE' as const },
  { id: 3, name: '박민수', email: 'park@example.com', joinedAt: '2025-10-21', tier: 'BUSINESS' as const },
  { id: 4, name: '정수진', email: 'jung@example.com', joinedAt: '2025-10-21', tier: 'FREE' as const },
  { id: 5, name: '최동욱', email: 'choi@example.com', joinedAt: '2025-10-21', tier: 'FREE' as const },
]

export function DashboardPage() {
  const { adminUser } = useAuthStore()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-2">
          환영합니다, <span className="font-semibold">{adminUser?.name}</span>님 ({adminUser?.role})
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              오늘도 좋은 하루 되세요! 👋
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              새로운 가입자가 {mockSignupData[mockSignupData.length - 1].count}명 있습니다.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium border border-gray-200">
              리포트 다운로드
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              공지사항 작성
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="전체 사용자"
          value={mockStats.totalUsers.toLocaleString()}
          change={mockStats.changes.users}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="활성 사용자"
          value={mockStats.activeUsers.toLocaleString()}
          change={mockStats.changes.activeUsers}
          icon={UserCheck}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="생성된 명함"
          value={mockStats.totalCards.toLocaleString()}
          change={mockStats.changes.cards}
          icon={CreditCard}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatCard
          title="월 매출"
          value={`₩${(mockStats.revenue / 10000).toFixed(0)}만`}
          change={mockStats.changes.revenue}
          icon={DollarSign}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SignupTrendChart data={mockSignupData} />
        </div>
        <div className="lg:col-span-1">
          <SubscriptionChart data={mockSubscriptionData} />
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">최근 가입자</h3>
            <p className="text-sm text-gray-500 mt-1">오늘 가입한 사용자 목록</p>
          </div>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
            전체 보기 →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">이름</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">이메일</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">가입일</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">구독 등급</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.joinedAt}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        user.tier === 'FREE'
                          ? 'bg-gray-100 text-gray-700'
                          : user.tier === 'PREMIUM'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {user.tier === 'FREE' ? '무료' : user.tier === 'PREMIUM' ? '프리미엄' : '비즈니스'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
