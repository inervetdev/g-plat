import { useQuery } from '@tanstack/react-query'
import {
  X,
  ExternalLink,
  Eye,
  Calendar,
  Smartphone,
  Globe,
  Monitor,
  Clock,
  MapPin,
  Link2,
  User,
  Building2,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import { fetchQRCodeStats } from '@/lib/api/qr'
import type { QRCodeWithDetails } from '@/types/admin'

interface QrDetailModalProps {
  qrCode: QRCodeWithDetails
  isOpen: boolean
  onClose: () => void
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function QrDetailModal({ qrCode, isOpen, onClose }: QrDetailModalProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['qr-stats', qrCode.id],
    queryFn: () => fetchQRCodeStats(qrCode.id),
    enabled: isOpen,
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=112x112&data=${encodeURIComponent(`https://g-plat.com/q/${qrCode.short_code}`)}`}
              alt={`QR: ${qrCode.short_code}`}
              className="w-14 h-14 rounded-lg"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {qrCode.business_card?.name || '명함 미연결'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                g-plat.com/q/{qrCode.short_code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* QR Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left - QR Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR 코드 정보</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Link2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">QR 링크</p>
                    <a
                      href={`https://g-plat.com/q/${qrCode.short_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      https://g-plat.com/q/{qrCode.short_code}
                    </a>
                  </div>
                </div>

                {qrCode.business_card && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">연결된 명함</p>
                      <p className="font-medium text-gray-900">{qrCode.business_card.name}</p>
                      {qrCode.business_card.company && (
                        <p className="text-sm text-gray-600">{qrCode.business_card.company}</p>
                      )}
                    </div>
                  </div>
                )}

                {qrCode.user && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">소유자</p>
                      <p className="font-medium text-gray-900">{qrCode.user.name}</p>
                      <p className="text-sm text-gray-600">{qrCode.user.email}</p>
                    </div>
                  </div>
                )}

                {qrCode.campaign && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">캠페인</p>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded">
                        {qrCode.campaign}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">생성일</p>
                    <p className="text-gray-900">
                      {new Date(qrCode.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>

                {qrCode.expires_at && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">만료일</p>
                      <p className={`${new Date(qrCode.expires_at) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(qrCode.expires_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Link */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <a
                  href={`https://g-plat.com/q/${qrCode.short_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  QR 링크 열기
                </a>
              </div>
            </div>

            {/* Right - Stats Summary */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">스캔 통계 요약</h3>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-white/80 text-sm">총 스캔</p>
                    <p className="text-3xl font-bold">{stats?.total_scans.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-white/80 text-sm">오늘</p>
                    <p className="text-3xl font-bold">{stats?.scans_today.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-white/80 text-sm">이번 주</p>
                    <p className="text-3xl font-bold">{stats?.scans_this_week.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-white/80 text-sm">이번 달</p>
                    <p className="text-3xl font-bold">{stats?.scans_this_month.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Charts */}
          {!isLoading && stats && (
            <>
              {/* Scans Over Time */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">일별 스캔 추이 (최근 30일)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.scans_by_day}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getMonth() + 1}/${date.getDate()}`
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                        formatter={(value: number) => [value, '스캔 수']}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Device / Browser / Country Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Device */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    디바이스별
                  </h3>
                  {stats.scans_by_device.length > 0 ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.scans_by_device}
                            dataKey="count"
                            nameKey="device"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            label={(props: any) =>
                              `${props.device || props.name} ${((props.percent || 0) * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {stats.scans_by_device.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">데이터 없음</p>
                  )}
                </div>

                {/* Browser */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-gray-400" />
                    브라우저별
                  </h3>
                  {stats.scans_by_browser.length > 0 ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.scans_by_browser.slice(0, 5)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis
                            type="category"
                            dataKey="browser"
                            tick={{ fontSize: 12 }}
                            width={80}
                          />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">데이터 없음</p>
                  )}
                </div>

                {/* Country */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    국가별
                  </h3>
                  {stats.scans_by_country.length > 0 ? (
                    <div className="space-y-3">
                      {stats.scans_by_country.slice(0, 5).map((item, index) => (
                        <div key={item.country} className="flex items-center justify-between">
                          <span className="text-gray-600">{item.country}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(item.count / stats.scans_by_country[0].count) * 100}%`,
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">데이터 없음</p>
                  )}
                </div>
              </div>

              {/* Recent Scans */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-400" />
                  최근 스캔 기록
                </h3>
                {stats.recent_scans.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            스캔 시간
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            디바이스
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            브라우저
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            OS
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            위치
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {stats.recent_scans.map((scan) => (
                          <tr key={scan.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(scan.scanned_at).toLocaleString('ko-KR')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {scan.device_type || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {scan.browser || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{scan.os || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {scan.city && scan.country
                                ? `${scan.city}, ${scan.country}`
                                : scan.country || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">스캔 기록이 없습니다</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
