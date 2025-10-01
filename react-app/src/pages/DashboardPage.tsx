import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'
import type { User } from '@supabase/supabase-js'
import type { ThemeName } from '../contexts/ThemeContext'

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [businessCards, setBusinessCards] = useState<any[]>([])
  const [cardCount, setCardCount] = useState(0)
  const [sideJobCount, setSideJobCount] = useState(0)
  const { theme, setTheme } = useTheme()

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
          setProfileData(profile)
          if (profile.theme) {
            setTheme(profile.theme)
          }
        }

        // 명함 데이터 가져오기
        const { data: cards, count } = await supabase
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
        const { data: sideJobCards, count: sideJobCount } = await supabase
          .from('sidejob_cards')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)

        if (sideJobCards) {
          setSideJobCount(sideJobCards.length)
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

  const handleThemeChange = async (newTheme: ThemeName) => {
    setTheme(newTheme)

    // 대표 명함의 테마 업데이트
    if (user && businessCards.length > 0) {
      const primaryCard = businessCards.find(card => card.is_primary) || businessCards[0]

      if (primaryCard) {
        await supabase
          .from('business_cards')
          .update({
            theme: newTheme,
            updated_at: new Date().toISOString()
          })
          .eq('id', primaryCard.id)
      }
    }

    // 사용자 프로필에도 저장
    if (user) {
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          theme: newTheme,
          updated_at: new Date().toISOString()
        })
    }
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
              onClick={() => window.location.href = '/create-card'}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              명함 만들기
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

        {/* Business Cards Management */}
        {businessCards.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">내 명함 목록</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessCards.map(card => (
                <div key={card.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{card.name}</h4>
                      <p className="text-sm text-gray-600">{card.title}</p>
                      <p className="text-xs text-gray-500">{card.company}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {card.is_primary && (
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">대표</span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        card.theme === 'trendy' ? 'bg-cyan-100 text-cyan-600' :
                        card.theme === 'apple' ? 'bg-gray-100 text-gray-600' :
                        card.theme === 'professional' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {card.theme === 'trendy' ? '트렌디' :
                         card.theme === 'apple' ? '애플' :
                         card.theme === 'professional' ? '프로페셔널' : '심플'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <p>📞 {card.phone}</p>
                    <p>✉️ {card.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/card/${card.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-50 text-blue-600 text-center py-2 rounded hover:bg-blue-100 transition text-sm"
                    >
                      보기
                    </a>
                    <button
                      onClick={() => window.location.href = `/qr/${card.id}`}
                      className="flex-1 bg-purple-50 text-purple-600 text-center py-2 rounded hover:bg-purple-100 transition text-sm"
                    >
                      QR
                    </button>
                    <button
                      onClick={() => window.location.href = `/edit-card/${card.id}`}
                      className="flex-1 bg-green-50 text-green-600 text-center py-2 rounded hover:bg-green-100 transition text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('정말 이 명함을 삭제하시겠습니까?')) {
                          const { error } = await supabase
                            .from('business_cards')
                            .delete()
                            .eq('id', card.id)
                            .eq('user_id', user?.id)

                          if (!error) {
                            alert('명함이 삭제되었습니다')
                            checkUser()
                          }
                        }
                      }}
                      className="flex-1 bg-red-50 text-red-600 text-center py-2 rounded hover:bg-red-100 transition text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Theme Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">명함 테마 선택</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { id: 'trendy', name: '트렌디', emoji: '✨', color: 'from-green-400 to-cyan-400' },
              { id: 'apple', name: '애플', emoji: '🍎', color: 'from-gray-400 to-gray-600' },
              { id: 'professional', name: '프로페셔널', emoji: '💼', color: 'from-blue-900 to-blue-700' },
              { id: 'simple', name: '심플', emoji: '⚪', color: 'from-blue-200 to-purple-200' },
              { id: 'default', name: '기본', emoji: '🎨', color: 'from-purple-400 to-pink-400' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id as ThemeName)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  theme === t.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {theme === t.id && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
                <div className={`w-full h-20 bg-gradient-to-br ${t.color} rounded-lg mb-3 flex items-center justify-center text-2xl`}>
                  {t.emoji}
                </div>
                <p className="text-sm font-medium text-gray-700">{t.name}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 현재 선택된 테마: <strong>{theme === 'trendy' ? '트렌디' : theme === 'apple' ? '애플' : theme === 'professional' ? '프로페셔널' : theme === 'simple' ? '심플' : '기본'}</strong>
            </p>
            {user && businessCards.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {businessCards.map(card => (
                  <a
                    key={card.id}
                    href={`/card/${card.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    {card.name} 명함 보기 →
                  </a>
                ))}
              </div>
            )}
            {user && businessCards.length === 0 && (
              <a
                href={`/card/${user.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                내 명함 미리보기 →
              </a>
            )}
          </div>
        </div>

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