import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface VisitorStat {
  id: string
  user_id: string
  visitor_ip: string | null
  user_agent: string | null
  referrer: string | null
  page_visited: string
  created_at: string
}

interface StatsSummary {
  totalViews: number
  todayViews: number
  weeklyViews: number
  monthlyViews: number
  uniqueVisitors: number
  topReferrers: { name: string; count: number }[]
  dailyStats: { date: string; views: number }[]
  deviceStats: { name: string; value: number }[]
}

export default function StatsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsSummary>({
    totalViews: 0,
    todayViews: 0,
    weeklyViews: 0,
    monthlyViews: 0,
    uniqueVisitors: 0,
    topReferrers: [],
    dailyStats: [],
    deviceStats: []
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      // 방문자 통계 데이터 가져오기
      const { data: visitorStats, error } = await supabase
        .from('visitor_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching stats:', error)
        return
      }

      if (visitorStats && visitorStats.length > 0) {
        // 통계 계산
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        // 오늘, 주간, 월간 방문수
        const todayViews = visitorStats.filter(stat =>
          new Date(stat.created_at) >= today
        ).length

        const weeklyViews = visitorStats.filter(stat =>
          new Date(stat.created_at) >= weekAgo
        ).length

        const monthlyViews = visitorStats.filter(stat =>
          new Date(stat.created_at) >= monthAgo
        ).length

        // 유니크 방문자 수
        const uniqueIPs = new Set(visitorStats.map(stat => stat.visitor_ip).filter(ip => ip))

        // 상위 리퍼러
        const referrerCounts: { [key: string]: number } = {}
        visitorStats.forEach(stat => {
          if (stat.referrer) {
            const domain = new URL(stat.referrer).hostname
            referrerCounts[domain] = (referrerCounts[domain] || 0) + 1
          }
        })
        const topReferrers = Object.entries(referrerCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }))

        // 일별 통계 (최근 7일)
        const dailyData: { [key: string]: number } = {}
        for (let i = 0; i < 7; i++) {
          const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
          const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
          dailyData[dateStr] = 0
        }

        visitorStats.forEach(stat => {
          const statDate = new Date(stat.created_at)
          if (statDate >= weekAgo) {
            const dateStr = statDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
            if (dateStr in dailyData) {
              dailyData[dateStr]++
            }
          }
        })

        const dailyStats = Object.entries(dailyData)
          .reverse()
          .map(([date, views]) => ({ date, views }))

        // 디바이스 통계 (간단한 분류)
        const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 }
        visitorStats.forEach(stat => {
          if (stat.user_agent) {
            if (/mobile/i.test(stat.user_agent)) {
              deviceCounts.Mobile++
            } else if (/tablet|ipad/i.test(stat.user_agent)) {
              deviceCounts.Tablet++
            } else {
              deviceCounts.Desktop++
            }
          }
        })

        const deviceStats = Object.entries(deviceCounts)
          .filter(([_, value]) => value > 0)
          .map(([name, value]) => ({ name, value }))

        setStats({
          totalViews: visitorStats.length,
          todayViews,
          weeklyViews,
          monthlyViews,
          uniqueVisitors: uniqueIPs.size,
          topReferrers,
          dailyStats,
          deviceStats
        })
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">통계 로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">방문자 통계</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">총 조회수</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalViews}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">오늘</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">{stats.todayViews}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">이번 주</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">{stats.weeklyViews}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">이번 달</h3>
            <p className="text-2xl font-bold text-purple-600 mt-2">{stats.monthlyViews}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">고유 방문자</h3>
            <p className="text-2xl font-bold text-orange-600 mt-2">{stats.uniqueVisitors}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 일별 방문 추이 */}
          {stats.dailyStats.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">일별 방문 추이</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#0088FE" name="조회수" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 디바이스 통계 */}
          {stats.deviceStats.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">디바이스별 접속</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.deviceStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.deviceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 상위 리퍼러 */}
          {stats.topReferrers.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">상위 유입 경로</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topReferrers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F" name="방문수" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 통계가 없을 때 메시지 */}
          {stats.totalViews === 0 && (
            <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">아직 방문 기록이 없습니다.</p>
              <p className="text-gray-400">명함을 공유하면 방문자 통계를 확인할 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}