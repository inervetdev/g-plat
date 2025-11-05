import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { CardDetailStats } from '@/types/admin'

interface DeviceChartProps {
  data: CardDetailStats['views_by_device']
}

// 디바이스별 색상 매핑
const COLORS: Record<string, string> = {
  Mobile: '#3b82f6',    // blue
  Desktop: '#8b5cf6',   // purple
  Tablet: '#10b981',    // green
  Other: '#6b7280'      // gray
}

/**
 * 디바이스별 조회 분포 차트
 * Mobile, Desktop, Tablet 등 디바이스 유형별 분포를 파이 차트로 표시
 */
export function DeviceChart({ data }: DeviceChartProps) {
  // 데이터가 없으면 빈 상태 표시
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">디바이스 데이터가 없습니다</p>
          <p className="text-sm mt-2">방문자가 생기면 여기에 통계가 표시됩니다</p>
        </div>
      </div>
    )
  }

  // 퍼센트 계산
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const chartData = data.map(item => ({
    ...item,
    percentage: ((item.count / total) * 100).toFixed(1)
  }))

  // 커스텀 라벨
  const renderLabel = (entry: any) => {
    return `${entry.device} (${entry.percentage}%)`
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.device] || COLORS.Other}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
            formatter={(value: number, _name: string, props: any) => [
              `${value}회 (${props.payload.percentage}%)`,
              props.payload.device
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
