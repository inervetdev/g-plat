import type { CardDetailStats } from '@/types/admin'
import { Globe, Smartphone, Monitor, Tablet } from 'lucide-react'

interface VisitorsTableProps {
  data: CardDetailStats['recent_visitors']
}

/**
 * 최근 방문자 목록 테이블
 * 최근 50명의 방문자 정보를 테이블로 표시
 */
export function VisitorsTable({ data }: VisitorsTableProps) {
  // 데이터가 없으면 빈 상태 표시
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-medium">방문자 데이터가 없습니다</p>
        <p className="text-sm mt-2">명함이 조회되면 여기에 방문자 정보가 표시됩니다</p>
      </div>
    )
  }

  // 디바이스 아이콘 렌더링
  const getDeviceIcon = (device?: string) => {
    switch (device) {
      case 'Mobile':
        return <Smartphone className="w-4 h-4 text-blue-600" />
      case 'Desktop':
        return <Monitor className="w-4 h-4 text-purple-600" />
      case 'Tablet':
        return <Tablet className="w-4 h-4 text-green-600" />
      default:
        return <Globe className="w-4 h-4 text-gray-600" />
    }
  }

  // 브라우저별 색상
  const getBrowserColor = (browser?: string) => {
    switch (browser) {
      case 'Chrome':
        return 'text-blue-600 bg-blue-50'
      case 'Safari':
        return 'text-indigo-600 bg-indigo-50'
      case 'Firefox':
        return 'text-orange-600 bg-orange-50'
      case 'Edge':
        return 'text-cyan-600 bg-cyan-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // 시간 포맷팅
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              방문 시간
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              디바이스
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              브라우저
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              유입 경로
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP 주소
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((visitor) => (
            <tr key={visitor.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatTime(visitor.visited_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(visitor.device)}
                  <span className="text-sm text-gray-900">
                    {visitor.device || 'Unknown'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBrowserColor(
                    visitor.browser
                  )}`}
                >
                  {visitor.browser || 'Unknown'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {visitor.referrer ? (
                  <a
                    href={visitor.referrer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    title={visitor.referrer}
                  >
                    {new URL(visitor.referrer).hostname}
                  </a>
                ) : (
                  <span className="text-gray-400">직접 방문</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {visitor.visitor_ip || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
