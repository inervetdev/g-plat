import { useState } from 'react'
import { X, Loader2, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function UserCreateModal({ isOpen, onClose, onSuccess }: UserCreateModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    subscription_tier: 'FREE' as 'FREE' | 'PREMIUM' | 'BUSINESS'
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Supabase Auth에 사용자 생성 (일반 회원가입 방식)
      // Note: Admin API는 service_role 키가 필요하므로 프론트엔드에서 사용 불가
      // 대신 일반 signUp을 사용하되, 이메일 인증은 Supabase Dashboard에서 수동으로 처리
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          },
          emailRedirectTo: undefined // OTP 방식이 아닌 일반 회원가입
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('사용자 생성에 실패했습니다')
      }

      console.log('✅ Auth user created:', authData.user.id)
      console.log('⚠️  이메일 인증 필요: Supabase Dashboard에서 이메일을 확인해주세요')

      // 2. users 테이블에 데이터 삽입
      const { error: userInsertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          subscription_tier: formData.subscription_tier,
          status: 'active'
        })

      if (userInsertError) {
        console.error('User table insert error:', userInsertError)

        // 중복 이메일 에러 처리
        if (userInsertError.code === '23505') {
          throw new Error('이미 존재하는 이메일입니다. 다른 이메일을 사용하거나, Supabase Dashboard에서 기존 사용자를 확인하세요.')
        }

        // Auth 사용자는 생성되었으므로 orphan 레코드 경고
        console.warn('⚠️  users 테이블 삽입 실패. Supabase Dashboard에서 auth.users의 orphan 레코드를 삭제하세요:', authData.user.id)
        throw new Error(userInsertError.message)
      }

      console.log('✅ User profile created')

      // 3. user_profiles 테이블에 데이터 삽입
      const { error: profileInsertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id
        })

      if (profileInsertError) {
        console.warn('⚠️ Profile creation failed (non-critical):', profileInsertError)
      }

      alert(`사용자가 성공적으로 생성되었습니다.\n\n이메일: ${formData.email}\n비밀번호: ${formData.password}\n\n⚠️ 중요: 사용자가 로그인하려면 이메일 인증이 필요합니다.\nSupabase Dashboard에서 수동으로 이메일을 확인 처리하거나,\n사용자에게 이메일 인증 링크를 클릭하도록 안내해주세요.`)

      // 폼 초기화
      setFormData({
        email: '',
        password: '',
        name: '',
        subscription_tier: 'FREE'
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('User creation error:', err)
      setError(err.message || '사용자 생성에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const generateRandomPassword = () => {
    const length = 12
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData(prev => ({ ...prev, password }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">신규 사용자 추가</h2>
              <p className="text-sm text-gray-500">새로운 사용자 계정을 생성합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* 이름 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="홍길동"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이메일 *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="user@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              사용자가 로그인할 때 사용할 이메일 주소입니다
            </p>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              비밀번호 *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="최소 6자 이상"
              />
              <button
                type="button"
                onClick={generateRandomPassword}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition whitespace-nowrap"
              >
                자동 생성
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              임시 비밀번호를 생성하고 사용자에게 전달하세요. 사용자는 로그인 후 비밀번호를 변경할 수 있습니다.
            </p>
          </div>

          {/* 구독 등급 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              구독 등급 *
            </label>
            <select
              value={formData.subscription_tier}
              onChange={(e) => setFormData(prev => ({ ...prev, subscription_tier: e.target.value as any }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="FREE">무료 (FREE)</option>
              <option value="PREMIUM">프리미엄 (PREMIUM)</option>
              <option value="BUSINESS">비즈니스 (BUSINESS)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              사용자의 초기 구독 등급을 설정합니다
            </p>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-1">📌 주의사항</p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>생성된 계정 정보는 사용자에게 안전하게 전달해주세요</li>
              <li>이메일 주소는 중복될 수 없습니다</li>
              <li>사용자는 로그인 후 비밀번호를 변경할 수 있습니다</li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  사용자 생성
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
