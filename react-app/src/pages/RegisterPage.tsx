import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Step = 'form' | 'verify-otp'

function RegisterPage() {
  const [step, setStep] = useState<Step>('form')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' })
      setLoading(false)
      return
    }

    // 비밀번호 길이 확인
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: '비밀번호는 최소 6자 이상이어야 합니다.' })
      setLoading(false)
      return
    }

    try {
      // Supabase Auth에 사용자 등록 (Email OTP 방식)
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone
          },
          emailRedirectTo: undefined // OTP 방식 사용
        }
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({
          type: 'success',
          text: `${formData.email}로 인증 코드를 발송했습니다. 이메일을 확인해주세요.`
        })
        setStep('verify-otp')
      }
    } catch (err) {
      setMessage({ type: 'error', text: '회원가입 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!otp || otp.length !== 6) {
      setMessage({ type: 'error', text: '6자리 인증 코드를 입력해주세요.' })
      setLoading(false)
      return
    }

    try {
      // OTP 검증
      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otp,
        type: 'signup'
      })

      if (error) {
        setMessage({ type: 'error', text: '인증 코드가 올바르지 않습니다. 다시 확인해주세요.' })
      } else if (data.user) {
        // 회원가입 성공 - users 테이블에 데이터 저장
        try {
          const { error: userInsertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: formData.email,
              name: formData.name,
              phone: formData.phone || null
            } as any)

          if (!userInsertError) {
            // user_profiles 초기화
            await supabase
              .from('user_profiles')
              .insert({
                user_id: data.user.id
              } as any)
          }
        } catch (err) {
          console.log('Profile creation deferred:', err)
        }

        setMessage({
          type: 'success',
          text: '이메일 인증이 완료되었습니다! 로그인 페이지로 이동합니다...'
        })

        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'OTP 검증 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      })

      if (error) {
        setMessage({ type: 'error', text: '인증 코드 재전송에 실패했습니다.' })
      } else {
        setMessage({ type: 'success', text: '인증 코드를 다시 전송했습니다.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: '재전송 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">회원가입</h1>
          <p className="text-gray-600">
            {step === 'form' ? 'G-Plat 계정을 만들어보세요' : '이메일 인증'}
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="홍길동"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(최소 6자)</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex items-start">
              <input
                id="agree"
                type="checkbox"
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="agree" className="ml-2 text-sm text-gray-600">
                <a href="/terms" className="text-green-600 hover:underline">이용약관</a> 및{' '}
                <a href="/privacy" className="text-green-600 hover:underline">개인정보처리방침</a>에
                동의합니다
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '인증 코드 발송 중...' : '인증 코드 받기'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{formData.email}</strong>로
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
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                인증 코드 (6자리)
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '인증 중...' : '인증 완료'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-green-600 hover:text-green-700 underline disabled:opacity-50"
              >
                인증 코드 다시 받기
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('form')
                setOtp('')
                setMessage(null)
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
            >
              이전 단계로
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <a href="/login" className="text-green-600 hover:underline font-medium">
              로그인
            </a>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
