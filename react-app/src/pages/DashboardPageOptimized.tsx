import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase'
import CardWithSideJobs from '../components/CardWithSideJobs'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { TierLimitBadge, TierLimitBadgeWithProgress } from '../components/TierLimitBadge'
import { TIER_CONFIG } from '../lib/subscription'

// Type definitions
type BusinessCard = Database['public']['Tables']['business_cards']['Row']
type SideJobCard = Database['public']['Tables']['sidejob_cards']['Row']
type UserData = Database['public']['Tables']['users']['Row']

const StatCard = ({
  title,
  icon,
  count,
  subtitle,
  buttonText,
  buttonColor,
  onClick
}: {
  title: string
  icon: string
  count: number
  subtitle: string
  buttonText: string
  buttonColor: string
  onClick: () => void
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-2xl sm:text-3xl">{icon}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold text-${buttonColor}-600`}>{count}</p>
      <p className="text-gray-600 text-xs sm:text-sm mt-1">{subtitle}</p>
      <button
        onClick={onClick}
        className={`mt-3 sm:mt-4 w-full bg-${buttonColor}-600 text-white py-2.5 sm:py-2 min-h-[44px] rounded text-sm sm:text-base hover:bg-${buttonColor}-700 transition`}
      >
        {buttonText}
      </button>
    </div>
  )
}

const CardThumbnail = ({
  card,
  sideJobCount,
  onClick
}: {
  card: BusinessCard
  sideJobCount: number
  onClick: () => void
}) => {
  const themeNames: Record<string, string> = {
    trendy: '트렌디',
    apple: '애플',
    professional: '프로페셔널',
    simple: '심플',
    default: '기본'
  }

  return (
    <button
      onClick={onClick}
      className="group relative p-4 sm:p-6 min-h-[44px] border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left w-full"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
        {card.profile_image && (
          <img
            src={card.profile_image}
            alt={card.name}
            className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover flex-shrink-0"
            loading="lazy"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{card.name}</h4>
          {card.title && (
            <p className="text-xs sm:text-sm text-gray-500 truncate">{card.title}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-gray-600">
          테마: {themeNames[card.theme] || '기본'}
        </span>
        <span className="text-blue-600 font-medium">
          {sideJobCount}개 부가명함
        </span>
      </div>

      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </div>
    </button>
  )
}

function DashboardPageOptimized() {
  const { user: authUser, signOut } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([])
  const [sideJobCards, setSideJobCards] = useState<SideJobCard[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const { setTheme } = useTheme()

  // Subscription tier limits
  const { limits } = useSubscriptionStore()

  useEffect(() => {
    if (authUser) {
      loadUserData()
    }
  }, [authUser])

  const loadUserData = async () => {
    if (!authUser) return

    try {
      setUser(authUser)

      // Parallel query execution for better performance
      const [
        { data: userData },
        { data: profile },
        { data: cards },
        { data: sideJobCardsData }
      ] = await Promise.all([
        supabase
          .from('users')
          .select('id, email, name, subscription_tier')
          .eq('id', authUser.id)
          .single(),

        supabase
          .from('user_profiles')
          .select('theme_settings')
          .eq('user_id', authUser.id)
          .single(),

        supabase
          .from('business_cards')
          .select('id, name, title, profile_image, theme, is_primary, created_at')
          .eq('user_id', authUser.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),

        supabase
          .from('sidejob_cards')
          .select('id, business_card_id, is_active')
          .eq('user_id', authUser.id)
          .order('display_order', { ascending: true })
      ])

      setUserData(userData as UserData)

      if (profile?.theme_settings) {
        setTheme(profile.theme_settings as any)
      } else if (cards) {
        const primaryCard = cards.find(card => card.is_primary)
        if (primaryCard?.theme) {
          setTheme(primaryCard.theme as any)
        }
      }

      if (cards) {
        setBusinessCards(cards as BusinessCard[])
        if (cards.length > 0) {
          setSelectedCardId(cards[0].id)
        }
      }

      if (sideJobCardsData) {
        setSideJobCards(sideJobCardsData as SideJobCard[])
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Force navigation even on error
      window.location.href = '/'
    }
  }

  const handleCardPreview = (cardId: string) => {
    setSelectedCardId(cardId)
    setShowPreviewModal(true)
  }

  const handleClosePreview = () => {
    setShowPreviewModal(false)
  }

  const cardCount = businessCards.length
  const sideJobCount = sideJobCards.length

  if (!authUser && !loading) {
    window.location.href = '/login'
    return null
  }

  if (loading || !authUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              G-Plat 대시보드
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-sm sm:text-base hover:bg-red-700 transition duration-200"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                안녕하세요, {userData?.name || user?.email?.split('@')[0]}님! 👋
              </h2>
              <p className="text-sm sm:text-base text-gray-600 truncate">
                {user?.email} | 가입일: {new Date(user?.created_at || '').toLocaleDateString('ko-KR')}
              </p>
            </div>

            {/* Tier Badge */}
            {limits && (
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <span className="text-xs sm:text-sm font-medium text-blue-900">
                    {TIER_CONFIG[limits.tier].displayName} 플랜
                  </span>
                </div>
                {limits.grandfathered && (
                  <div className="px-2 sm:px-3 py-1 bg-orange-50 border border-orange-200 rounded-lg">
                    <span className="text-[10px] sm:text-xs text-orange-700">⭐ 얼리어답터 특별 혜택</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tier Limits Progress Bars */}
          {limits && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <TierLimitBadgeWithProgress limits={limits} type="cards" />
              <TierLimitBadgeWithProgress limits={limits} type="sidejobs" />
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          <StatCard
            title="명함 관리"
            icon="🏷️"
            count={cardCount}
            subtitle="등록된 명함"
            buttonText="명함 관리"
            buttonColor="blue"
            onClick={() => window.location.href = '/card-manage'}
          />
          <StatCard
            title="부가명함"
            icon="💼"
            count={sideJobCount}
            subtitle="사이드 비즈니스"
            buttonText="부가명함 관리"
            buttonColor="indigo"
            onClick={() => window.location.href = '/sidejob-cards'}
          />
          <StatCard
            title="방문자 통계"
            icon="📊"
            count={0}
            subtitle="오늘 방문자"
            buttonText="통계 보기"
            buttonColor="green"
            onClick={() => window.location.href = '/stats'}
          />
          <StatCard
            title="콜백 현황"
            icon="📞"
            count={0}
            subtitle="대기 중"
            buttonText="설정하기"
            buttonColor="purple"
            onClick={() => {}}
          />
        </div>

        {/* Card Preview */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">내 명함 미리보기</h3>

          {businessCards.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="mb-3 sm:mb-4 text-sm sm:text-base">등록된 명함이 없습니다.</p>
              <button
                onClick={() => window.location.href = '/create-card'}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 min-h-[44px] rounded-lg text-sm sm:text-base hover:bg-blue-700"
              >
                첫 명함 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {businessCards.map((card) => {
                const sideJobsForCard = sideJobCards.filter(
                  sj => !sj.business_card_id || sj.business_card_id === card.id
                ).length

                return (
                  <CardThumbnail
                    key={card.id}
                    card={card}
                    sideJobCount={sideJobsForCard}
                    onClick={() => handleCardPreview(card.id)}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreviewModal && selectedCardId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">
                  {businessCards.find(c => c.id === selectedCardId)?.name} 명함 미리보기
                </h3>
                <button
                  onClick={handleClosePreview}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="미리보기 닫기"
                >
                  <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                <CardWithSideJobs
                  businessCard={businessCards.find(c => c.id === selectedCardId)!}
                  sideJobCards={sideJobCards.filter(sj =>
                    sj.is_active && (!sj.business_card_id || sj.business_card_id === selectedCardId)
                  )}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl sm:rounded-b-2xl">
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => window.location.href = `/card/${selectedCardId}`}
                    className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2.5 min-h-[44px] rounded-lg text-sm sm:text-base hover:bg-blue-700 transition-colors"
                  >
                    실제 명함 보기
                  </button>
                  <button
                    onClick={() => window.location.href = `/edit-card/${selectedCardId}`}
                    className="flex-1 bg-gray-200 text-gray-700 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-lg text-sm sm:text-base hover:bg-gray-300 transition-colors"
                  >
                    명함 수정
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-2 text-center">
                  💡 부가명함을 연결하려면 <a href="/sidejob-cards" className="text-blue-600 underline">부가명함 관리</a>로 이동하세요.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default DashboardPageOptimized