import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase'
import CardWithSideJobs from '../components/CardWithSideJobs'

// Type definitions
type BusinessCard = Database['public']['Tables']['business_cards']['Row']
type SideJobCard = Database['public']['Tables']['sidejob_cards']['Row']
type UserData = Database['public']['Tables']['users']['Row']

// React Compiler will automatically optimize this component
// No need for manual memo, useCallback, or useMemo!
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold text-${buttonColor}-600`}>{count}</p>
      <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
      <button
        onClick={onClick}
        className={`mt-4 w-full bg-${buttonColor}-600 text-white py-2 rounded hover:bg-${buttonColor}-700 transition`}
      >
        {buttonText}
      </button>
    </div>
  )
}

// React Compiler will automatically optimize this component
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
      className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left"
    >
      <div className="flex items-center gap-3 mb-3">
        {card.profile_image && (
          <img
            src={card.profile_image}
            alt={card.name}
            className="w-12 h-12 rounded-full object-cover"
            loading="lazy"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{card.name}</h4>
          {card.title && (
            <p className="text-sm text-gray-500 truncate">{card.title}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          테마: {themeNames[card.theme] || '기본'}
        </span>
        <span className="text-blue-600 font-medium">
          {sideJobCount}개 부가명함
        </span>
      </div>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </div>
    </button>
  )
}

// Main component - React Compiler will optimize all functions automatically
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

  useEffect(() => {
    if (authUser) {
      loadUserData()
    }
  }, [authUser])

  // No need for useCallback - React Compiler handles it!
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

  // Simple functions - no manual optimization needed!
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

  // No need for useMemo - React Compiler optimizes these automatically
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              G-Plat 대시보드
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                React Compiler 최적화
              </span>
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            안녕하세요, {userData?.name || user?.email?.split('@')[0]}님! 👋
          </h2>
          <p className="text-gray-600">
            {user?.email} | 가입일: {new Date(user?.created_at || '').toLocaleDateString('ko-KR')}
          </p>
        </div>

        {/* Stats Grid - Automatically optimized by React Compiler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

        {/* Card Preview - Optimized rendering */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">내 명함 미리보기</h3>

          {businessCards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">등록된 명함이 없습니다.</p>
              <button
                onClick={() => window.location.href = '/create-card'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                첫 명함 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-lg font-semibold text-gray-900">
                  {businessCards.find(c => c.id === selectedCardId)?.name} 명함 미리보기
                </h3>
                <button
                  onClick={handleClosePreview}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="미리보기 닫기"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <CardWithSideJobs
                  businessCard={businessCards.find(c => c.id === selectedCardId)!}
                  sideJobCards={sideJobCards.filter(sj =>
                    sj.is_active && (!sj.business_card_id || sj.business_card_id === selectedCardId)
                  )}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.href = `/card/${selectedCardId}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    실제 명함 보기
                  </button>
                  <button
                    onClick={() => window.location.href = `/edit-card/${selectedCardId}`}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    명함 수정
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  💡 부가명함을 연결하려면 <a href="/sidejob-cards" className="text-blue-600 underline">부가명함 관리</a>로 이동하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* React Compiler Info */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ⚡ React Compiler 자동 최적화 적용
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            이 페이지는 React Compiler 1.0으로 자동 최적화되었습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded">
              <span className="text-green-600 font-semibold">✓ 자동 메모이제이션</span>
              <p className="text-gray-500">memo, useMemo 불필요</p>
            </div>
            <div className="bg-white p-3 rounded">
              <span className="text-green-600 font-semibold">✓ 콜백 최적화</span>
              <p className="text-gray-500">useCallback 자동 처리</p>
            </div>
            <div className="bg-white p-3 rounded">
              <span className="text-green-600 font-semibold">✓ 리렌더링 최소화</span>
              <p className="text-gray-500">불필요한 렌더링 제거</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPageOptimized