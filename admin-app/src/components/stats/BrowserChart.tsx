import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import type { CardDetailStats } from '@/types/admin'

interface BrowserChartProps {
  data: CardDetailStats['views_by_browser']
}

// 브라우저별 색상 매핑
const BROWSER_COLORS: Record<string, string> = {
  Chrome: '#4285f4',    // Google Blue
  Safari: '#007aff',    // Safari Blue
  Firefox: '#ff7139',   // Firefox Orange
  Edge: '#0078d7',      // Edge Blue
  Other: '#6b7280'      // Gray
}

/**
 * 브라우저별 조회 분포 차트
 * Chrome, Safari, Firefox 등 브라우저 유형별 분포를 막대 그래프로 표시
 */
export function BrowserChart({ data }: BrowserChartProps) {
  // 데이터가 없으면 빈 상태 표시
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">브라우저 데이터가 없습니다</p>
          <p className="text-sm mt-2">방문자가 생기면 여기에 통계가 표시됩니다</p>
        </div>
      </div>
    )
  }

  // 퍼센트 계산 및 정렬 (count 내림차순)
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const chartData = data
    .map(item => ({
      ...item,
      percentage: ((item.count / total) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="browser"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
            formatter={(value: number, _name: string, props: any) => [
              `${value}회 (${props.payload.percentage}%)`,
              props.payload.browser
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            iconType="square"
          />
          <Bar
            dataKey="count"
            name="조회수"
            radius={[8, 8, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={BROWSER_COLORS[entry.browser] || BROWSER_COLORS.Other}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
