import { useState } from 'react'
import { supabase } from '../lib/supabase'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [showResendEmail, setShowResendEmail] = useState(false)

  const handleResendEmail = async () => {
    if (!email) {
      setMessage({ type: 'error', text: '이메일을 입력해주세요.' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        setMessage({ type: 'error', text: '이메일 재전송에 실패했습니다.' })
      } else {
        setMessage({ type: 'success', text: '확인 이메일을 다시 전송했습니다. 이메일을 확인해주세요.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: '이메일 재전송 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // 더 친절한 에러 메시지
        let errorMessage = error.message
        if (error.message === 'Invalid login credentials') {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다. 이메일 확인을 완료했는지 확인해주세요.'
          setShowResendEmail(true)
        } else if (error.message === 'Email not confirmed') {
          errorMessage = '이메일 확인이 필요합니다. 받으신 이메일의 확인 링크를 클릭해주세요.'
          setShowResendEmail(true)
        }
        setMessage({ type: 'error', text: errorMessage })
      } else if (data.user) {
        // 사용자 프로필이 없는 경우 생성 (첫 로그인 시)
        const { error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (userError && userError.code === 'PGRST116') {
          // 사용자 데이터가 없으면 생성
          await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User'
            })

          await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id
            })
        }

        setMessage({ type: 'success', text: '로그인 성공! 대시보드로 이동합니다...' })
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      }
    } catch (err) {
      setMessage({ type: 'error', text: '로그인 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">로그인</h1>
          <p className="text-gray-600">G-Plat 계정으로 로그인하세요</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
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
              {showResendEmail && message.type === 'error' && (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="mt-2 block w-full text-center text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  확인 이메일 다시 받기
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            비밀번호를 잊으셨나요?
          </a>
          <div className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <a href="/register" className="text-blue-600 hover:underline font-medium">
              회원가입
            </a>
          </div>
        </div>

        <div className="mt-6">
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

export default LoginPage