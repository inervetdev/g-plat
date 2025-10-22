interface SubscriptionData {
  tier: 'FREE' | 'PREMIUM' | 'BUSINESS'
  count: number
  percentage: number
}

interface SubscriptionChartProps {
  data: SubscriptionData[]
}

const tierConfig = {
  FREE: {
    label: '무료',
    color: 'bg-gray-500',
    lightColor: 'bg-gray-100',
    textColor: 'text-gray-700',
  },
  PREMIUM: {
    label: '프리미엄',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  BUSINESS: {
    label: '비즈니스',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
}

export function SubscriptionChart({ data }: SubscriptionChartProps) {
  const totalUsers = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">구독 현황</h3>
        <p className="text-sm text-gray-500 mt-1">전체 {totalUsers.toLocaleString()}명</p>
      </div>

      <div className="space-y-4">
        {data.map((item) => {
          const config = tierConfig[item.tier]
          return (
            <div key={item.tier}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${config.textColor}`}>
                  {config.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.count.toLocaleString()}명
                  </span>
                  <span className="text-xs text-gray-500">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full ${config.color} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          {data.map((item) => {
            const config = tierConfig[item.tier]
            return (
              <div
                key={item.tier}
                className={`${config.lightColor} rounded-lg p-3 text-center`}
              >
                <p className={`text-xs font-medium ${config.textColor} mb-1`}>
                  {config.label}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {item.percentage.toFixed(0)}%
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
