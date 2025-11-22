import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Step = 'form' | 'verify-otp'

export default function NewRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string>('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      newErrors.email = '올바른 이메일을 입력해주세요'
    }

    if (password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다'
    }

    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'
    }

    if (!agreeTerms) {
      newErrors.terms = '이용약관에 동의해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({})
    setMessage('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          emailRedirectTo: undefined // OTP 방식 사용
        }
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ general: '이미 등록된 이메일입니다' })
        } else {
          setErrors({ general: '회원가입에 실패했습니다. 다시 시도해주세요' })
        }
      } else {
        setMessage(`${email}로 인증 코드를 발송했습니다. 이메일을 확인해주세요.`)
        setStep('verify-otp')
      }
    } catch (err) {
      setErrors({ general: '회원가입 중 오류가 발생했습니다' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setMessage('')

    if (!otp || otp.length !== 6) {
      setErrors({ general: '6자리 인증 코드를 입력해주세요.' })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'  // Updated: 'signup' is deprecated, use 'email' for signup OTP
      })

      if (error) {
        setErrors({ general: '인증 코드가 올바르지 않습니다. 다시 확인해주세요.' })
      } else if (data.user) {
        // users 테이블에 데이터 저장
        try {
          const { error: userInsertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email,
              name
            } as any)

          if (!userInsertError) {
            await supabase
              .from('user_profiles')
              .insert({
                user_id: data.user.id
              } as any)
          }
        } catch (err) {
          console.log('Profile creation deferred:', err)
        }

        setMessage('이메일 인증이 완료되었습니다! 로그인 페이지로 이동합니다...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err) {
      setErrors({ general: 'OTP 검증 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setErrors({})
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) {
        setErrors({ general: '인증 코드 재전송에 실패했습니다.' })
      } else {
        setMessage('인증 코드를 다시 전송했습니다.')
      }
    } catch (err) {
      setErrors({ general: '재전송 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    if (provider !== '구글') {
      alert(`${provider} 로그인은 준비 중입니다`)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md mx-auto pt-12 pb-24 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {step === 'form' ? '회원가입' : '이메일 인증'}
          </h1>
          <p className="text-gray-600">
            {step === 'form' ? 'G-Plat에서 나만의 명함을 만들어보세요' : '이메일로 전송된 인증 코드를 입력하세요'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'form' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="홍길동"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="example@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="최소 6자 이상"
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                {errors.passwordConfirm && (
                  <p className="mt-1 text-sm text-red-500">{errors.passwordConfirm}</p>
                )}
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  <Link to="/terms" className="text-blue-600 hover:underline">이용약관</Link> 및{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline">개인정보처리방침</Link>에
                  동의합니다
                </label>
              </div>
              {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}

              {message && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {message}
                </div>
              )}

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? '인증 코드 발송 중...' : '인증 코드 받기'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">또는</span>
                </div>
              </div>

              <div className="space-y-3">
                {['구글', '카카오', '애플'].map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => handleSocialLogin(provider)}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border-2 transition ${
                      provider === '구글'
                        ? 'border-gray-300 hover:bg-gray-50'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className="font-medium text-gray-700">
                      {provider}로 계속하기
                    </span>
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>{email}</strong>로
                  </p>
                  <p className="text-sm text-gray-600">
                    6자리 인증 코드를 발송했습니다.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                  인증 코드 (6자리)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              {message && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {message}
                </div>
              )}

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? '인증 중...' : '인증 완료'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
                >
                  인증 코드 다시 받기
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('form')
                  setOtp('')
                  setMessage('')
                  setErrors({})
                }}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
              >
                이전 단계로
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
