import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  const cardLinks = [
    { title: '모바일 명함 (간단)', path: '/demo?theme=simple' },
    { title: '모바일 명함 (전문가)', path: '/demo?theme=professional' },
    { title: '모바일 명함 (트렌디)', path: '/demo?theme=trendy' },
    { title: '모바일 명함 (애플)', path: '/demo?theme=apple' }
  ]

  const dashboardLinks = [
    { title: '대시보드 (간단)', path: '/dashboard' },
    { title: '대시보드 (전문가)', path: '/dashboard' },
    { title: '대시보드 (트렌디)', path: '/dashboard' },
    { title: '대시보드 (애플)', path: '/dashboard' }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="text-center text-white p-12 rounded-[20px] max-w-4xl mx-4" style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Logo */}
        <div className="mb-4">
          <img
            src="/assets/GP 로고.png"
            alt="G-PLAT"
            className="h-20 mx-auto mb-4"
            onError={(e) => {
              // 로고 로딩 실패 시 텍스트로 대체
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold mb-4">G-PLAT</h1>

        {/* Subtitle */}
        <p className="text-xl mb-8 opacity-90">
          모바일 명함으로 시작하는 부업 플랫폼
        </p>

        {/* Links */}
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          {cardLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => navigate(link.path)}
              className="px-8 py-4 bg-white text-[#667eea] rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
            >
              {link.title}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {dashboardLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => navigate(link.path)}
              className="px-8 py-4 bg-white text-[#667eea] rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
            >
              {link.title}
            </button>
          ))}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-[#667eea] rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          >
            로그인
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-[#667eea] rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          >
            회원가입
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-lg text-sm" style={{
          background: 'rgba(255, 255, 255, 0.1)'
        }}>
          <p className="mb-2">✅ React + Vite 개발 서버 실행 중</p>
          <p>💡 Supabase 기반 실시간 명함 플랫폼</p>
        </div>
      </div>
    </div>
  )
}
