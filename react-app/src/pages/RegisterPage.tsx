import { useState } from 'react'
import { supabase } from '../lib/supabase'

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
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
      // 1. Supabase Auth에 사용자 등록
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone
          }
        }
      })

      if (authError) {
        setMessage({ type: 'error', text: authError.message })
      } else if (authData.user) {
        // 회원가입 성공 - users 테이블에 데이터 저장 시도
        try {
          // Service role key를 사용하거나 RLS 정책이 허용하는 경우에만 성공
          const { error: userInsertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: formData.email,
              name: formData.name,
              phone: formData.phone || null
            } as any)

          if (userInsertError) {
            console.log('Note: User profile will be created on first login:', userInsertError)
          } else {
            // user_profiles 초기화
            await supabase
              .from('user_profiles')
              .insert({
                user_id: authData.user.id
              } as any)
          }
        } catch (err) {
          console.log('Profile creation deferred to first login:', err)
        }

        // Pro 플랜이므로 이메일이 발송됨
        setMessage({
          type: 'success',
          text: '회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요. 스팸 폴더도 확인해보세요.'
        })

        setTimeout(() => {
          window.location.href = '/login'
        }, 5000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: '회원가입 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">회원가입</h1>
          <p className="text-gray-600">G-Plat 계정을 만들어보세요</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
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
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>

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