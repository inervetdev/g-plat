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
  { id: 1, name: '김철수', email: 'kim@example.com', joinedAt: '2025-10-21', tier: 'PREMIUM' },
  { id: 2, name: '이영희', email: 'lee@example.com', joinedAt: '2025-10-21', tier: 'FREE' },
  { id: 3, name: '박민수', email: 'park@example.com', joinedAt: '2025-10-21', tier: 'BUSINESS' },
  { id: 4, name: '정수진', email: 'jung@example.com', joinedAt: '2025-10-21', tier: 'FREE' },
  { id: 5, name: '최동욱', email: 'choi@example.com', joinedAt: '2025-10-21', tier: 'FREE' },
]

export function DashboardPage() {
  const { adminUser } = useAuthStore()

  return (
    <div className="p-8">
      {/* Page Header */}
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
        {/* Total Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">전체 사용자</p>
            <p className="text-3xl font-bold text-gray-900">1,234</p>
          </div>
        </div>

        {/* Business Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              +8.2%
            </span>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">명함 수</p>
            <p className="text-3xl font-bold text-gray-900">5,678</p>
          </div>
        </div>

        {/* Sidejob Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              +15.3%
            </span>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">부가명함 수</p>
            <p className="text-3xl font-bold text-gray-900">890</p>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              +22.1%
            </span>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">월 매출</p>
            <p className="text-3xl font-bold text-gray-900">₩4.5M</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            최근 가입 사용자
          </h2>
          <div className="space-y-3">
            {[
              { name: '김철수', email: 'kim@example.com', date: '2시간 전' },
              { name: '이영희', email: 'lee@example.com', date: '5시간 전' },
              { name: '박민수', email: 'park@example.com', date: '1일 전' },
              { name: '정수진', email: 'jung@example.com', date: '1일 전' },
            ].map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{user.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-red-600" />
            처리 대기 중인 신고
            <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
              8
            </span>
          </h2>
          <div className="space-y-3">
            {[
              { type: '스팸 신고', target: '명함 #1234', date: '30분 전' },
              { type: '부적절한 콘텐츠', target: '부가명함 #5678', date: '2시간 전' },
              { type: '허위 정보', target: '명함 #9012', date: '3시간 전' },
              { type: '중복 계정', target: '사용자 #3456', date: '5시간 전' },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-red-50 rounded-xl hover:bg-red-100 transition cursor-pointer"
              >
                <div>
                  <p className="font-medium text-gray-900">{report.type}</p>
                  <p className="text-sm text-gray-600">{report.target}</p>
                </div>
                <span className="text-xs text-gray-500">{report.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
