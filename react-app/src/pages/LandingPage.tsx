import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 transition-all ${
        scrolled ? 'shadow-md' : 'border-b border-gray-200'
      }`}>
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <a href="/" className="flex items-center gap-1.5 sm:gap-2 text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
              <span>🎯</span>
              <span>지플랫</span>
            </a>

            <ul className="hidden md:flex items-center gap-6 lg:gap-8 list-none">
              <li><button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-indigo-600 font-medium transition-colors min-h-[44px]">주요 기능</button></li>
              <li><button onClick={() => scrollToSection('process')} className="text-gray-700 hover:text-indigo-600 font-medium transition-colors min-h-[44px]">이용 방법</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-indigo-600 font-medium transition-colors min-h-[44px]">요금제</button></li>
              <li><button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-indigo-600 font-medium transition-colors min-h-[44px]">회사 소개</button></li>
            </ul>

            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-3 sm:px-6 py-2 min-h-[44px] bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition-all"
                  >
                    대시보드
                  </button>
                  <button
                    onClick={handleLogout}
                    className="hidden sm:block px-6 py-2 min-h-[44px] border-2 border-gray-400 text-gray-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="hidden sm:block px-4 sm:px-6 py-2 min-h-[44px] border-2 border-indigo-600 text-indigo-600 rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-3 sm:px-6 py-2 min-h-[44px] bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition-all"
                  >
                    무료 시작
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-10 sm:pb-16 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-3/5 h-full bg-gradient-to-r from-indigo-500 to-pink-500 opacity-10 rounded-l-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="hero-content text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 sm:mb-6 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                모바일 명함으로<br/>부업을 시작하세요
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                3분 만에 완성하는 나만의 모바일 명함<br/>
                한글 도메인으로 쉽게 공유하고 부업을 관리하세요
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  🚀 무료로 시작하기
                </button>
                <button
                  onClick={() => navigate('/demo')}
                  className="px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold text-base sm:text-lg hover:bg-indigo-600 hover:text-white transition-all"
                >
                  👀 데모 보기
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">10K+</div>
                  <div className="text-xs sm:text-sm text-gray-600">활성 사용자</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">50+</div>
                  <div className="text-xs sm:text-sm text-gray-600">파트너사</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">99.9%</div>
                  <div className="text-xs sm:text-sm text-gray-600">서비스 가용성</div>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative max-w-xs sm:max-w-sm md:max-w-md mx-auto mt-8 md:mt-0">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl">
                <div className="bg-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
                  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4">
                    <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-full flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-semibold flex-shrink-0">
                      김
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold truncate">김대리</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">마케팅 매니저 · ABC컴퍼니</p>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow hover:-translate-y-1 transition-transform cursor-pointer">
                      <h4 className="text-sm sm:text-base font-semibold mb-0.5 sm:mb-1">🏠 정수기 렌탈</h4>
                      <p className="text-xs sm:text-sm text-gray-600">월 29,900원부터 · 무료설치</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow hover:-translate-y-1 transition-transform cursor-pointer">
                      <h4 className="text-sm sm:text-base font-semibold mb-0.5 sm:mb-1">🚗 자동차 보험</h4>
                      <p className="text-xs sm:text-sm text-gray-600">최대 30% 할인 · 실시간 견적</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow hover:-translate-y-1 transition-transform cursor-pointer">
                      <h4 className="text-sm sm:text-base font-semibold mb-0.5 sm:mb-1">📚 온라인 강의</h4>
                      <p className="text-xs sm:text-sm text-gray-600">마케팅 실무 · 수료증 발급</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="hidden lg:block absolute -left-20 top-1/4 bg-white rounded-xl p-4 shadow-xl animate-float">
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">자동 콜백</div>
                <p className="text-xs mt-2">통화 후 자동 전송</p>
              </div>
              <div className="hidden lg:block absolute -right-20 bottom-1/4 bg-white rounded-xl p-4 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">한글도메인</div>
                <p className="text-xs mt-2">김대리.한국</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              지플랫만의 특별한 기능
            </h2>
            <p className="text-base sm:text-lg text-gray-600">복잡한 설정 없이 바로 시작할 수 있는 강력한 기능들</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              { icon: '📱', title: '3분 완성', desc: '직관적인 인터페이스로 누구나 쉽게 명함을 만들 수 있습니다' },
              { icon: '🌐', title: '한글 도메인', desc: '이름.한국 형태의 기억하기 쉬운 개인 URL을 제공합니다' },
              { icon: '📲', title: '자동 콜백', desc: '통화 종료 후 자동으로 명함 URL을 전송합니다' },
              { icon: '💼', title: '부업 관리', desc: '여러 부업을 카드 형태로 쉽게 관리할 수 있습니다' },
              { icon: '📊', title: '실시간 통계', desc: '방문자, 클릭률 등 상세한 통계를 실시간으로 확인합니다' },
              { icon: '🔗', title: 'SNS 연동', desc: '인스타그램, 유튜브 등 다양한 SNS를 연결할 수 있습니다' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-gray-200 hover:-translate-y-2 hover:shadow-xl transition-all text-center">
                <div className="w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 mx-auto mb-4 sm:mb-5 md:mb-6 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-12 sm:py-16 md:py-20 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              간단한 3단계로 시작하세요
            </h2>
            <p className="text-base sm:text-lg text-gray-600">복잡한 과정 없이 빠르게 나만의 명함을 만들어보세요</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden sm:block absolute top-8 sm:top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-600 to-pink-600" />

            {[
              { num: '1', title: '회원가입', desc: '이메일 또는 SNS로 간편하게 가입하고 한글 도메인을 받으세요' },
              { num: '2', title: '명함 제작', desc: '템플릿을 선택하고 정보를 입력하여 명함을 완성하세요' },
              { num: '3', title: '부업 등록', desc: '관심 있는 부업을 선택하고 카드로 만들어 공유하세요' }
            ].map((step, i) => (
              <div key={i} className="relative text-center z-10">
                <div className="w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 mx-auto mb-4 sm:mb-5 md:mb-6 bg-white border-3 sm:border-4 border-indigo-600 rounded-full flex items-center justify-center text-xl sm:text-2xl font-extrabold text-indigo-600">
                  {step.num}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              합리적인 요금제
            </h2>
            <p className="text-base sm:text-lg text-gray-600">필요에 따라 선택할 수 있는 다양한 플랜</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              {
                name: '무료',
                price: '0',
                desc: '개인 사용자를 위한 기본 플랜',
                features: ['기본 명함 기능', '부업 카드 3개', '월 100회 콜백', '기본 통계', '지플랫 서브도메인'],
                cta: '무료로 시작',
                featured: false
              },
              {
                name: '프리미엄',
                price: '9,900',
                desc: '전문가를 위한 프리미엄 플랜',
                features: ['무제한 부업 카드', '무제한 콜백 발송', '고급 통계 분석', '커스텀 한글 도메인', '우선 고객 지원', '광고 제거'],
                cta: '프리미엄 시작',
                featured: true
              },
              {
                name: '비즈니스',
                price: '29,900',
                desc: '팀과 기업을 위한 비즈니스 플랜',
                features: ['프리미엄 기능 전체', '팀 계정 5명', 'API 연동', '전담 매니저', '맞춤형 교육', '우선 기술 지원'],
                cta: '문의하기',
                featured: false
              }
            ].map((plan, i) => (
              <div key={i} className={`bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 relative transition-all ${
                plan.featured
                  ? 'border-2 border-indigo-600 md:transform md:scale-105 shadow-xl order-first md:order-none'
                  : 'border-2 border-gray-200 hover:-translate-y-2 hover:shadow-xl'
              }`}>
                {plan.featured && (
                  <div className="absolute -top-3 sm:-top-4 right-4 sm:right-8 bg-indigo-600 text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                    인기
                  </div>
                )}
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{plan.name}</h3>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-600 mb-1 sm:mb-2">
                    {plan.price}<span className="text-sm sm:text-base text-gray-600 font-normal">원/월</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">{plan.desc}</p>
                </div>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                      <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(plan.featured ? '/register' : plan.name === '무료' ? '/register' : '/contact')}
                  className={`w-full py-2.5 sm:py-3 min-h-[44px] rounded-lg text-sm sm:text-base font-semibold transition-all ${
                    plan.featured
                      ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white hover:shadow-lg'
                      : 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4">지금 바로 시작하세요</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">3분이면 충분합니다. 복잡한 절차 없이 바로 명함을 만들어보세요.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] bg-white text-indigo-600 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-all"
            >
              🚀 무료로 시작하기
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] border-2 border-white text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-indigo-600 transition-all"
            >
              📞 상담 신청
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-gray-900 text-white py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">지플랫</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                개인 부업 포트폴리오 모바일 명함 웹 빌더<br/>
                누구나 쉽게 시작할 수 있는 부업 플랫폼
              </p>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">서비스</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">주요 기능</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">요금제</a></li>
                <li><a href="#" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">템플릿</a></li>
                <li><a href="#" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">지원</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">도움말</a></li>
                <li><a href="#" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">문의하기</a></li>
                <li><a href="#" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">블로그</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">회사</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">회사 소개</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">이용약관</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">파트너</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-400">
            <p>© 2025 지플랫. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
