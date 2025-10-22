import type { LucideProps } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
  icon: React.ComponentType<LucideProps>
  iconColor: string
  iconBgColor: string
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBgColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>

          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm font-medium ${
                  change.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-gray-500">vs 지난달</span>
            </div>
          )}
        </div>

        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${iconBgColor}`}
          style={{
            background: `linear-gradient(135deg, ${iconBgColor} 0%, ${iconBgColor}dd 100%)`,
          }}
        >
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}
