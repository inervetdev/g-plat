import { ExternalLink, Image as ImageIcon, Calendar, DollarSign } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface UserSideJobsTabProps {
  userId: string
}

export function UserSideJobsTab({ userId }: UserSideJobsTabProps) {
  const { data: sidejobs, isLoading, error } = useQuery({
    queryKey: ['userSidejobs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sidejob_cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
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
        <p className="text-red-600 text-center">부가명함 목록을 불러오는 중 오류가 발생했습니다</p>
        <p className="text-gray-500 text-sm text-center mt-2">{(error as Error).message}</p>
      </div>
    )
  }

  if (!sidejobs || sidejobs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 border border-gray-100 text-center">
        <p className="text-gray-500 text-lg">생성된 부가명함이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sidejobs.map((sidejob) => (
        <div
          key={sidejob.id}
          className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition"
        >
          {/* Image */}
          {sidejob.image_url ? (
            <div className="aspect-video bg-gray-200 relative">
              <img
                src={sidejob.image_url}
                alt={sidejob.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-white opacity-50" />
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            {/* Title & Badge */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {sidejob.title}
                </h3>
                {sidejob.badge && (
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      sidejob.badge === 'HOT'
                        ? 'bg-red-100 text-red-700'
                        : sidejob.badge === '인기'
                        ? 'bg-orange-100 text-orange-700'
                        : sidejob.badge === '신규'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {sidejob.badge}
                  </span>
                )}
              </div>
              {sidejob.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{sidejob.description}</p>
              )}
            </div>

            {/* Categories */}
            {(sidejob.primary_category || sidejob.secondary_category) && (
              <div className="mb-3 flex items-center gap-2">
                {sidejob.primary_category && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    {sidejob.primary_category}
                  </span>
                )}
                {sidejob.secondary_category && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {sidejob.secondary_category}
                  </span>
                )}
              </div>
            )}

            {/* Price & Expiry */}
            <div className="flex items-center justify-between mb-3 text-sm">
              {sidejob.price && (
                <div className="flex items-center gap-1 text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">{sidejob.price}</span>
                </div>
              )}
              {sidejob.expiry_date && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">
                    {new Date(sidejob.expiry_date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}
            </div>

            {/* CTA Link */}
            {sidejob.cta_link && (
              <a
                href={sidejob.cta_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                {sidejob.cta_text || '자세히 보기'}
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Metadata */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>순서: {sidejob.display_order || 0}</span>
              <span>{new Date(sidejob.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
