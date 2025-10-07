import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'
import type { User } from '@supabase/supabase-js'
import CardWithSideJobs from '../components/CardWithSideJobs'

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [businessCards, setBusinessCards] = useState<any[]>([])
  const [cardCount, setCardCount] = useState(0)
  const [sideJobCount, setSideJobCount] = useState(0)
  const [sideJobCards, setSideJobCards] = useState<any[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const { setTheme } = useTheme()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        // 사용자 데이터 가져오기
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        setUserData(userData)

        // 프로필 데이터 가져오기
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profile) {
          if (profile.theme) {
            setTheme(profile.theme)
          }
        }

        // 명함 데이터 가져오기
        const { data: cards } = await supabase
          .from('business_cards')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (cards) {
          setBusinessCards(cards)
          setCardCount(cards.length)

          // 대표 명함이 있으면 그 테마 사용
          const primaryCard = cards.find(card => card.is_primary)
          if (primaryCard && primaryCard.theme) {
            setTheme(primaryCard.theme)
          }
        }

        // 부가명함(사이드잡) 데이터 가져오기
        const { data: sideJobCardsData } = await supabase
          .from('sidejob_cards')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('display_order', { ascending: true })

        if (sideJobCardsData) {
          setSideJobCards(sideJobCardsData)
          setSideJobCount(sideJobCardsData.length)
        }

        // 첫 번째 명함을 기본 선택
        if (cards && cards.length > 0) {
          setSelectedCardId(cards[0].id)
        }
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
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
            <h1 className="text-2xl font-bold text-gray-900">G-Plat 대시보드</h1>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">명함 관리</h3>
              <span className="text-3xl">🏷️</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{cardCount}</p>
            <p className="text-gray-600 text-sm mt-1">등록된 명함</p>
            <button
              onClick={() => window.location.href = '/card-manage'}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              명함 관리
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">부가명함</h3>
              <span className="text-3xl">💼</span>
            </div>
            <p className="text-3xl font-bold text-indigo-600">{sideJobCount}</p>
            <p className="text-gray-600 text-sm mt-1">사이드 비즈니스</p>
            <button
              onClick={() => window.location.href = '/sidejob-cards'}
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
              부가명함 관리
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">방문자 통계</h3>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-gray-600 text-sm mt-1">오늘 방문자</p>
            <button
              onClick={() => window.location.href = '/stats'}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
              통계 보기
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">콜백 현황</h3>
              <span className="text-3xl">📞</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-gray-600 text-sm mt-1">대기 중</p>
            <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
              설정하기
            </button>
          </div>
        </div>


        {/* Card Preview with SideJobs - Card Grid */}
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
              {businessCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => {
                    setSelectedCardId(card.id)
                    setShowPreviewModal(true)
                  }}
                  className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left"
                >
                  {/* 명함 썸네일 */}
                  <div className="flex items-center gap-3 mb-3">
                    {card.profile_image && (
                      <img
                        src={card.profile_image}
                        alt={card.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{card.name}</h4>
                      {card.title && (
                        <p className="text-sm text-gray-500 truncate">{card.title}</p>
                      )}
                    </div>
                  </div>

                  {/* 테마 및 부가명함 개수 */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      테마: {card.theme === 'trendy' ? '트렌디' : card.theme === 'apple' ? '애플' : card.theme === 'professional' ? '프로페셔널' : card.theme === 'simple' ? '심플' : '기본'}
                    </span>
                    <span className="text-blue-600 font-medium">
                      {sideJobCards.filter(sj => !sj.business_card_id || sj.business_card_id === card.id).length}개 부가명함
                    </span>
                  </div>

                  {/* 호버 시 미리보기 아이콘 */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreviewModal && selectedCardId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-lg font-semibold text-gray-900">
                  {businessCards.find(c => c.id === selectedCardId)?.name} 명함 미리보기
                </h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <CardWithSideJobs
                  businessCard={businessCards.find(c => c.id === selectedCardId)!}
                  sideJobCards={sideJobCards.filter(sj =>
                    !sj.business_card_id || sj.business_card_id === selectedCardId
                  )}
                />
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <span className="text-2xl mb-2 block">🏷️</span>
              <span className="text-sm text-gray-700">새 명함 만들기</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <span className="text-2xl mb-2 block">📱</span>
              <span className="text-sm text-gray-700">명함 미리보기</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <span className="text-2xl mb-2 block">📊</span>
              <span className="text-sm text-gray-700">분석 리포트</span>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <span className="text-2xl mb-2 block">⚙️</span>
              <span className="text-sm text-gray-700">설정</span>
            </button>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">현재 플랜: 무료</h3>
              <p className="text-gray-600 text-sm">
                프리미엄으로 업그레이드하고 더 많은 기능을 사용해보세요!
              </p>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition">
              업그레이드 →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage