import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SignupTrendData {
  date: string
  count: number
}

interface SignupTrendChartProps {
  data: SignupTrendData[]
}

type TimeFilter = 'daily' | 'weekly' | 'monthly'

export function SignupTrendChart({ data }: SignupTrendChartProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('daily')

  // 실제 구현에서는 timeFilter에 따라 데이터를 가공
  const filteredData = data

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">가입 추이</h3>
          <p className="text-sm text-gray-500 mt-1">신규 사용자 가입 현황</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTimeFilter('daily')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeFilter === 'daily'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            일간
          </button>
          <button
            onClick={() => setTimeFilter('weekly')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeFilter === 'weekly'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setTimeFilter('monthly')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeFilter === 'monthly'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            월간
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: '#111827', fontWeight: 600 }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            fill="url(#colorCount)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
