import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Step = 'email' | 'verify-otp' | 'reset-password'

function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false // 기존 사용자만 허용
        }
      })

      if (error) {
        setMessage({ type: 'error', text: '이메일 주소를 확인해주세요.' })
      } else {
        setMessage({
          type: 'success',
          text: `${email}로 인증 코드를 발송했습니다.`
        })
        setStep('verify-otp')
      }
    } catch (err) {
      setMessage({ type: 'error', text: '인증 코드 발송 중 오류가 발생했습니다.' })
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
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      })

      if (error) {
        setMessage({ type: 'error', text: '인증 코드가 올바르지 않습니다. 다시 확인해주세요.' })
      } else if (data.user) {
        setMessage({
          type: 'success',
          text: '인증이 완료되었습니다. 새 비밀번호를 설정해주세요.'
        })
        setStep('reset-password')
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'OTP 검증 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // 비밀번호 확인
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' })
      setLoading(false)
      return
    }

    // 비밀번호 길이 확인
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '비밀번호는 최소 6자 이상이어야 합니다.' })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setMessage({ type: 'error', text: '비밀번호 변경에 실패했습니다.' })
      } else {
        setMessage({
          type: 'success',
          text: '비밀번호가 성공적으로 변경되었습니다! 로그인 페이지로 이동합니다...'
        })

        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: '비밀번호 변경 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false
        }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">비밀번호 찾기</h1>
          <p className="text-gray-600">
            {step === 'email' && '이메일 주소를 입력해주세요'}
            {step === 'verify-otp' && '이메일 인증'}
            {step === 'reset-password' && '새 비밀번호 설정'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="example@email.com"
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
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '인증 코드 발송 중...' : '인증 코드 받기'}
            </button>
          </form>
        )}

        {step === 'verify-otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
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
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                인증 코드 (6자리)
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
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
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '인증 중...' : '인증 완료'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-purple-600 hover:text-purple-700 underline disabled:opacity-50"
              >
                인증 코드 다시 받기
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('email')
                setOtp('')
                setMessage(null)
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
            >
              이전 단계로
            </button>
          </form>
        )}

        {step === 'reset-password' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호
                <span className="text-xs text-gray-500 ml-1">(최소 6자)</span>
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '비밀번호 변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">
            <a href="/login" className="text-purple-600 hover:underline font-medium">
              로그인으로 돌아가기
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

export default ForgotPasswordPage
