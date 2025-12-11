import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { RestrictedStatsOverlay } from '../components/RestrictedStatsOverlay'

interface StatsSummary {
  totalViews: number
  todayViews: number
  weeklyViews: number
  monthlyViews: number
  uniqueVisitors: number
  topReferrers: { name: string; count: number }[]
  dailyStats: { date: string; views: number }[]
  deviceStats: { name: string; value: number }[]
  totalDownloads: number
  todayDownloads: number
  topDownloads: { title: string; count: number }[]
  totalQRScans: number
  todayQRScans: number
  qrDeviceStats: { name: string; value: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// Extracted Components
function StatCard({ title, value, valueColor = 'text-gray-900' }: { title: string; value: number; valueColor?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`text-2xl font-bold ${valueColor} mt-2`}>{value}</p>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-gray-800">{children}</h2>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}

function DailyTrendChart({ data }: { data: { date: string; views: number }[] }) {
  if (data.length === 0) return null

  return (
    <ChartCard title="일별 방문 추이">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="views" stroke="#0088FE" name="조회수" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function DevicePieChart({ data, title }: { data: { name: string; value: number }[]; title: string }) {
  if (data.length === 0) return null

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function TopReferrersChart({ data }: { data: { name: string; count: number }[] }) {
  if (data.length === 0) return null

  return (
    <ChartCard title="상위 유입 경로">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#00C49F" name="방문수" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function TopDownloadsChart({ data }: { data: { title: string; count: number }[] }) {
  if (data.length === 0) return null

  return (
    <ChartCard title="상위 다운로드 파일">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8B5CF6" name="다운로드 수" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function EmptyState() {
  return (
    <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center">
      <p className="text-gray-500 text-lg mb-4">아직 방문 기록이 없습니다.</p>
      <p className="text-gray-400">명함을 공유하면 방문자 통계를 확인할 수 있습니다.</p>
    </div>
  )
}

export default function StatsPageOptimized() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  // Subscription tier checking
  const { limits } = useSubscriptionStore()
  const hasAdvancedStats = limits?.hasAdvancedStats ?? false

  const [stats, setStats] = useState<StatsSummary>({
    totalViews: 0,
    todayViews: 0,
    weeklyViews: 0,
    monthlyViews: 0,
    uniqueVisitors: 0,
    topReferrers: [],
    dailyStats: [],
    deviceStats: [],
    totalDownloads: 0,
    todayDownloads: 0,
    topDownloads: [],
    totalQRScans: 0,
    todayQRScans: 0,
    qrDeviceStats: []
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
        .order('created_at', { ascending: false }) as any

      if (error) {
        console.error('Error fetching stats:', error)
        return
      }

      if (visitorStats && visitorStats.length > 0) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        const todayViews = visitorStats.filter((stat: any) =>
          new Date(stat.created_at) >= today
        ).length

        const weeklyViews = visitorStats.filter((stat: any) =>
          new Date(stat.created_at) >= weekAgo
        ).length

        const monthlyViews = visitorStats.filter((stat: any) =>
          new Date(stat.created_at) >= monthAgo
        ).length

        const uniqueIPs = new Set(visitorStats.map((stat: any) => stat.visitor_ip).filter((ip: any) => ip))

        const referrerCounts: { [key: string]: number } = {}
        visitorStats.forEach((stat: any) => {
          if (stat.referrer) {
            const domain = new URL(stat.referrer).hostname
            referrerCounts[domain] = (referrerCounts[domain] || 0) + 1
          }
        })
        const topReferrers = Object.entries(referrerCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }))

        const dailyData: { [key: string]: number } = {}
        for (let i = 0; i < 7; i++) {
          const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
          const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
          dailyData[dateStr] = 0
        }

        visitorStats.forEach((stat: any) => {
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

        const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 }
        visitorStats.forEach((stat: any) => {
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

        const { data: downloadStats } = await supabase
          .from('attachment_downloads' as any)
          .select('*, card_attachments!inner(title)')
          .eq('user_id', user.id)
          .order('downloaded_at', { ascending: false }) as any

        let totalDownloads = 0
        let todayDownloads = 0
        let topDownloads: { title: string; count: number }[] = []

        if (downloadStats && downloadStats.length > 0) {
          totalDownloads = downloadStats.length
          todayDownloads = downloadStats.filter((stat: any) =>
            new Date(stat.downloaded_at) >= today
          ).length

          const downloadCounts: { [key: string]: number } = {}
          downloadStats.forEach((stat: any) => {
            const title = stat.card_attachments?.title || '알 수 없음'
            downloadCounts[title] = (downloadCounts[title] || 0) + 1
          })
          topDownloads = Object.entries(downloadCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([title, count]) => ({ title, count }))
        }

        const { data: qrScans } = await supabase
          .from('qr_scans')
          .select('*, qr_codes!inner(business_card_id)')
          .eq('qr_codes.user_id', user.id)
          .order('scanned_at', { ascending: false }) as any

        let totalQRScans = 0
        let todayQRScans = 0
        let qrDeviceStats: { name: string; value: number }[] = []

        if (qrScans && qrScans.length > 0) {
          totalQRScans = qrScans.length
          todayQRScans = qrScans.filter((scan: any) =>
            new Date(scan.scanned_at) >= today
          ).length

          const qrDeviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 }
          qrScans.forEach((scan: any) => {
            if (scan.device_type === 'mobile') {
              qrDeviceCounts.Mobile++
            } else if (scan.device_type === 'tablet') {
              qrDeviceCounts.Tablet++
            } else if (scan.device_type === 'desktop') {
              qrDeviceCounts.Desktop++
            }
          })

          qrDeviceStats = Object.entries(qrDeviceCounts)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }))
        }

        setStats({
          totalViews: visitorStats.length,
          todayViews,
          weeklyViews,
          monthlyViews,
          uniqueVisitors: uniqueIPs.size,
          topReferrers,
          dailyStats,
          deviceStats,
          totalDownloads,
          todayDownloads,
          topDownloads,
          totalQRScans,
          todayQRScans,
          qrDeviceStats
        })
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setLoading(false)
    }
  }

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

        {/* 주요 지표 - 방문자 통계 */}
        <SectionTitle>방문자 통계</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard title="총 조회수" value={stats.totalViews} />
          <StatCard title="오늘" value={stats.todayViews} valueColor="text-blue-600" />
          <StatCard title="이번 주" value={stats.weeklyViews} valueColor="text-green-600" />
          <StatCard title="이번 달" value={stats.monthlyViews} valueColor="text-purple-600" />
          <StatCard title="고유 방문자" value={stats.uniqueVisitors} valueColor="text-orange-600" />
        </div>

        {/* 고급 통계 - 유료 플랜만 */}
        {hasAdvancedStats ? (
          <>
            {/* 소개자료 다운로드 통계 */}
            <SectionTitle>소개자료 다운로드 통계</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <StatCard title="총 다운로드" value={stats.totalDownloads} />
              <StatCard title="오늘 다운로드" value={stats.todayDownloads} valueColor="text-blue-600" />
            </div>

            {/* QR명함 스캔 통계 */}
            <SectionTitle>QR명함 스캔 통계</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <StatCard title="총 QR 스캔" value={stats.totalQRScans} />
              <StatCard title="오늘 QR 스캔" value={stats.todayQRScans} valueColor="text-blue-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyTrendChart data={stats.dailyStats} />
              <DevicePieChart data={stats.deviceStats} title="디바이스별 접속" />
              <TopReferrersChart data={stats.topReferrers} />
              <TopDownloadsChart data={stats.topDownloads} />
              <DevicePieChart data={stats.qrDeviceStats} title="QR 스캔 디바이스별 접속" />

              {stats.totalViews === 0 && <EmptyState />}
            </div>
          </>
        ) : (
          <>
            {/* 무료 플랜 - 고급 통계 제한 */}
            <SectionTitle>고급 통계</SectionTitle>
            <RestrictedStatsOverlay
              currentTier={limits?.tier || 'FREE'}
              title="유료 플랜 전용 통계"
              description="디바이스별 접속, 유입 경로, QR 스캔 분석, 다운로드 통계 등 고급 분석 기능은 유료 플랜 이상에서 제공됩니다."
            />
          </>
        )}
      </div>
    </div>
  )
}
