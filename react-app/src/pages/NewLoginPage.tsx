import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function NewLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      newErrors.email = '올바른 이메일을 입력해주세요'
    }

    // Password validation
    if (password.length < 6) {
      newErrors.password = '비밀번호를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      // 1. 로그인 시도
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setErrors({ general: '이메일 또는 비밀번호가 올바르지 않습니다' })
        } else if (error.message === 'Email not confirmed') {
          setErrors({ general: '이메일 인증이 필요합니다. 이메일을 확인해주세요' })
        } else {
          setErrors({ general: '로그인에 실패했습니다. 다시 시도해주세요' })
        }
      } else if (data.user) {
        // 2. 로그인 성공 후 사용자 상태 확인 (status 체크)
        const { data: userData, error: userError } = (await supabase
          .from('users')
          .select('id, status')
          .eq('id', data.user.id)
          .single()) as { data: { id: string; status: string } | null; error: any }

        // 3. 정지된 계정이면 즉시 로그아웃
        if (userData?.status === 'suspended') {
          await supabase.auth.signOut()
          setErrors({
            general: '계정이 정지되었습니다.\n관리자에게 문의하세요.'
          })
          setLoading(false)
          return
        }

        // 4. 정상 계정만 대시보드로 이동
        navigate('/dashboard')
      }
    } catch (err) {
      setErrors({ general: '로그인 중 오류가 발생했습니다' })
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'kakao' | 'google') => {
    if (provider === 'kakao') {
      alert('Kakao 로그인은 준비 중입니다')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        setErrors({ general: 'Google 로그인에 실패했습니다' })
      }
    } catch (err) {
      setErrors({ general: 'Google 로그인 중 오류가 발생했습니다' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="grid md:grid-cols-2 max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="bg-gradient-to-br from-indigo-600 to-pink-600 p-12 flex flex-col justify-center text-white relative overflow-hidden hidden md:flex">
          <div className="absolute top-0 right-0 w-full h-full opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              animation: 'float 20s linear infinite'
            }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-3xl font-extrabold mb-8">
              <span>🎯</span>
              <span>지플랫</span>
            </div>

            <h1 className="text-3xl font-bold mb-4">다시 만나서 반가워요!</h1>
            <p className="text-xl opacity-90 leading-relaxed mb-12">
              모바일 명함으로 시작하는 부업 플랫폼<br/>
              지플랫에서 새로운 기회를 만들어보세요
            </p>

            <div className="space-y-6">
              {[
                { icon: '📱', title: '3분 만에 완성', desc: '간편하게 모바일 명함 제작' },
                { icon: '🌐', title: '한글 도메인', desc: '이름.한국 개인 URL 제공' },
                { icon: '💼', title: '부업 관리', desc: '다양한 부업을 한 곳에서' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm opacity-90">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="p-12 flex flex-col justify-center">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-8 transition-colors">
            ← 홈으로 돌아가기
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">로그인</h2>
            <p className="text-gray-600">지플랫 계정으로 로그인하세요</p>
          </div>

          <form onSubmit={handleLogin} className="max-w-md w-full mx-auto">
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors({})
                }}
                className={`w-full px-4 py-3 border rounded-lg transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-300 focus:border-indigo-600'
                } focus:outline-none focus:ring-4 focus:ring-indigo-600/10`}
                placeholder="example@email.com"
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors({})
                }}
                className={`w-full px-4 py-3 border rounded-lg transition-all ${
                  errors.password ? 'border-red-500' : 'border-gray-300 focus:border-indigo-600'
                } focus:outline-none focus:ring-4 focus:ring-indigo-600/10`}
                placeholder="비밀번호를 입력하세요"
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-600"
                />
                <span className="text-gray-700">로그인 상태 유지</span>
              </label>
              <Link to="/forgot-password" className="text-indigo-600 hover:underline font-medium">
                비밀번호 찾기
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-500">또는</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('kakao')}
                className="w-full py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <div className="w-5 h-5 bg-yellow-400 rounded-full" />
                카카오로 시작하기
              </button>

              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <div className="w-5 h-5 bg-green-500 rounded-full" />
                네이버로 시작하기
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20">
                  <path d="M19.545 10.23c0-.637-.057-1.251-.164-1.84H10v3.481h5.372c-.233 1.234-.94 2.279-2.003 2.979v2.48h3.242c1.895-1.745 2.934-4.313 2.934-7.1z" fill="#4285F4"/>
                  <path d="M10 20c2.7 0 4.964-.896 6.62-2.42l-3.242-2.48c-.896.6-2.04.953-3.378.953-2.603 0-4.81-1.76-5.595-4.123H1.064v2.562A9.996 9.996 0 0010 20z" fill="#34A853"/>
                  <path d="M4.405 11.93c-.2-.6-.314-1.24-.314-1.93 0-.69.114-1.33.314-1.93V5.508H1.064A9.996 9.996 0 000 10c0 1.614.387 3.138 1.064 4.492l3.34-2.562z" fill="#FBBC05"/>
                  <path d="M10 3.947c1.468 0 2.785.505 3.823 1.496l2.868-2.868C14.959.99 12.696 0 10 0 6.09 0 2.71 2.24 1.064 5.508l3.34 2.562C5.19 5.707 7.397 3.947 10 3.947z" fill="#EA4335"/>
                </svg>
                구글로 시작하기
              </button>
            </div>
          </form>

          <div className="text-center mt-8 text-gray-600">
            아직 계정이 없으신가요?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline font-semibold">
              회원가입
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-50px, -50px); }
        }
      `}</style>
    </div>
  )
}
