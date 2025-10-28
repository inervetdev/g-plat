import { Activity, Eye } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface UserActivityTabProps {
  userId: string
}

export function UserActivityTab({ userId }: UserActivityTabProps) {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['userActivity', userId],
    queryFn: async () => {
      // Get visitor stats for user's cards
      const { data: cards } = await supabase
        .from('business_cards')
        .select('id')
        .eq('user_id', userId)

      if (!cards || cards.length === 0) return []

      const cardIds = cards.map((c) => c.id)

      const { data: visits, error: visitsError } = await supabase
        .from('visitor_stats')
        .select(`
          *,
          business_cards (
            id,
            name,
            company,
            custom_url
          )
        `)
        .in('card_id', cardIds)
        .order('visited_at', { ascending: false })
        .limit(50)

      if (visitsError) throw visitsError

      return visits || []
    },
    enabled: !!userId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-8 border border-gray-100">
        <p className="text-red-600 text-center">활동 로그를 불러오는 중 오류가 발생했습니다</p>
        <p className="text-gray-500 text-sm text-center mt-2">{(error as Error).message}</p>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 border border-gray-100 text-center">
        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">최근 활동 내역이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100">
      {/* Activity Timeline */}
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity: any) => (
            <div
              key={activity.id}
              className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      명함 조회
                    </p>
                    {activity.business_cards && (
                      <div className="mt-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{activity.business_cards.name}</span>
                          {activity.business_cards.company && (
                            <span className="text-gray-500"> · {activity.business_cards.company}</span>
                          )}
                        </p>
                        {activity.business_cards.custom_url && (
                          <a
                            href={`https://g-plat.com/card/${activity.business_cards.custom_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            g-plat.com/card/{activity.business_cards.custom_url}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      {activity.device && (
                        <span className="flex items-center gap-1">
                          📱 {activity.device}
                        </span>
                      )}
                      {activity.browser && (
                        <span className="flex items-center gap-1">
                          🌐 {activity.browser}
                        </span>
                      )}
                      {activity.referrer && (
                        <span className="flex items-center gap-1 truncate max-w-xs">
                          🔗 {new URL(activity.referrer).hostname}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.visited_at).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.visited_at).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          최근 50개의 활동 표시 · 총 {activities.length}개
        </p>
      </div>
    </div>
  )
}
