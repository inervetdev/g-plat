import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  BarChart3, Users, MousePointer, Globe,
  Smartphone, Monitor, Tablet, TrendingUp, Calendar,
  ArrowLeft, RefreshCw, Download
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface QRCodeData {
  id: string
  short_code: string
  target_url: string
  campaign: string
  scan_count: number
  created_at: string
  is_active: boolean
}

interface ScanData {
  id: string
  scanned_at: string
  ip_address: string
  device_type: string
  browser: string
  os: string
  referer: string
}

interface StatsData {
  totalScans: number
  uniqueVisitors: number
  todayScans: number
  deviceStats: { name: string; value: number }[]
  browserStats: { name: string; value: number }[]
  osStats: { name: string; value: number }[]
  hourlyStats: { hour: string; scans: number }[]
  dailyStats: { date: string; scans: number }[]
}

export default function QRStatsPage() {
  const { shortCode } = useParams<{ shortCode: string }>()
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [scans, setScans] = useState<ScanData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, all
  const [refreshing, setRefreshing] = useState(false)

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const fetchQRCode = async () => {
    if (!shortCode) return

    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('short_code', shortCode)
      .single()

    if (!error && data) {
      setQrCode(data)
    }
  }

  const fetchScans = async () => {
    if (!qrCode) return

    const { data, error } = await supabase
      .from('qr_scans')
      .select('*')
      .eq('qr_code_id', qrCode.id)
      .order('scanned_at', { ascending: false })

    if (!error && data) {
      setScans(data)
      processStats(data)
    }
  }

  const processStats = (scanData: ScanData[]) => {
    // Filter by time range
    const now = new Date()
    const filtered = scanData.filter(scan => {
      const scanDate = new Date(scan.scanned_at)
      if (timeRange === '7d') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return scanDate >= weekAgo
      } else if (timeRange === '30d') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return scanDate >= monthAgo
      }
      return true
    })

    // Calculate stats
    const uniqueIPs = new Set(filtered.map(s => s.ip_address))
    const today = new Date().toDateString()
    const todayScans = filtered.filter(s =>
      new Date(s.scanned_at).toDateString() === today
    ).length

    // Device stats
    const deviceCounts: { [key: string]: number } = {}
    filtered.forEach(scan => {
      deviceCounts[scan.device_type] = (deviceCounts[scan.device_type] || 0) + 1
    })
    const deviceStats = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }))

    // Browser stats
    const browserCounts: { [key: string]: number } = {}
    filtered.forEach(scan => {
      browserCounts[scan.browser] = (browserCounts[scan.browser] || 0) + 1
    })
    const browserStats = Object.entries(browserCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // OS stats
    const osCounts: { [key: string]: number } = {}
    filtered.forEach(scan => {
      osCounts[scan.os] = (osCounts[scan.os] || 0) + 1
    })
    const osStats = Object.entries(osCounts).map(([name, value]) => ({ name, value }))

    // Hourly stats (last 24 hours)
    const hourlyData: { [key: string]: number } = {}
    for (let i = 0; i < 24; i++) {
      hourlyData[`${i}:00`] = 0
    }
    filtered.forEach(scan => {
      const hour = new Date(scan.scanned_at).getHours()
      hourlyData[`${hour}:00`]++
    })
    const hourlyStats = Object.entries(hourlyData).map(([hour, scans]) => ({ hour, scans }))

    // Daily stats
    const dailyData: { [key: string]: number } = {}
    filtered.forEach(scan => {
      const date = new Date(scan.scanned_at).toLocaleDateString('ko-KR')
      dailyData[date] = (dailyData[date] || 0) + 1
    })
    const dailyStats = Object.entries(dailyData)
      .map(([date, scans]) => ({ date, scans }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setStats({
      totalScans: filtered.length,
      uniqueVisitors: uniqueIPs.size,
      todayScans,
      deviceStats,
      browserStats,
      osStats,
      hourlyStats,
      dailyStats
    })
  }

  const refreshStats = async () => {
    setRefreshing(true)
    await fetchScans()
    setRefreshing(false)
  }

  const exportStats = () => {
    if (!stats || !qrCode) return

    const csvContent = [
      ['QR Code Statistics Report'],
      ['Generated at', new Date().toLocaleString('ko-KR')],
      [''],
      ['QR Code Info'],
      ['Short Code', qrCode.short_code],
      ['Target URL', qrCode.target_url],
      ['Campaign', qrCode.campaign],
      ['Created', new Date(qrCode.created_at).toLocaleString('ko-KR')],
      [''],
      ['Summary'],
      ['Total Scans', stats.totalScans],
      ['Unique Visitors', stats.uniqueVisitors],
      ['Today Scans', stats.todayScans],
      [''],
      ['Recent Scans'],
      ['Time', 'Device', 'Browser', 'OS', 'IP'],
      ...scans.slice(0, 100).map(scan => [
        new Date(scan.scanned_at).toLocaleString('ko-KR'),
        scan.device_type,
        scan.browser,
        scan.os,
        scan.ip_address
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `qr-stats-${qrCode.short_code}-${Date.now()}.csv`
    link.click()
  }

  useEffect(() => {
    fetchQRCode()
  }, [shortCode])

  useEffect(() => {
    if (qrCode) {
      fetchScans()
    }
  }, [qrCode, timeRange])

  useEffect(() => {
    setLoading(false)
  }, [stats])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">통계 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">QR 코드를 찾을 수 없습니다</h2>
          <p className="mt-2 text-gray-600">올바른 QR 코드 링크인지 확인해주세요.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">QR 코드 통계</h1>
                <p className="text-sm text-gray-600">
                  {qrCode.short_code} • {qrCode.campaign}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshStats}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={exportStats}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="flex gap-2">
              {[
                { value: '7d', label: '최근 7일' },
                { value: '30d', label: '최근 30일' },
                { value: 'all', label: '전체' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    timeRange === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 스캔 수</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalScans || 0}</p>
              </div>
              <MousePointer className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">고유 방문자</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.uniqueVisitors || 0}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">오늘 스캔</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.todayScans || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">상태</p>
                <p className={`text-sm font-semibold ${qrCode.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {qrCode.is_active ? '활성' : '비활성'}
                </p>
              </div>
              <Globe className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Scans Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">일별 스캔 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.dailyStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="scans" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Type Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">디바이스 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.deviceStats || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats?.deviceStats.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Browser Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">브라우저 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.browserStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* OS Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">운영체제 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.osStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">최근 스캔 기록</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">시간</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">디바이스</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">브라우저</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scans.slice(0, 10).map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(scan.scanned_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center gap-1">
                        {scan.device_type === 'mobile' && <Smartphone className="w-4 h-4" />}
                        {scan.device_type === 'desktop' && <Monitor className="w-4 h-4" />}
                        {scan.device_type === 'tablet' && <Tablet className="w-4 h-4" />}
                        {scan.device_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{scan.browser}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{scan.os}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{scan.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {scans.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                아직 스캔 기록이 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}