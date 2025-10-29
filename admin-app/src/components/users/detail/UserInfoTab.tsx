import { useState } from 'react'
import { Edit2, Save, X, Calendar, Mail, Phone } from 'lucide-react'
import { useUpdateUser } from '@/hooks/useUsers'
import type { UserWithStats } from '@/types/admin'

interface UserInfoTabProps {
  user: UserWithStats
}

export function UserInfoTab({ user }: UserInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    email: string
    phone: string
    subscription_tier: 'FREE' | 'PREMIUM' | 'BUSINESS'
    status: 'active' | 'inactive' | 'suspended'
  }>({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    subscription_tier: user.subscription_tier || 'FREE',
    status: (user.status as 'active' | 'inactive' | 'suspended') || 'active',
  })

  const updateUserMutation = useUpdateUser()

  const handleSave = async () => {
    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        data: formData,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      subscription_tier: user.subscription_tier || 'FREE',
      status: (user.status as 'active' | 'inactive' | 'suspended') || 'active',
    })
    setIsEditing(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Info Card */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">기본 정보</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <Edit2 className="w-4 h-4" />
              편집
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={updateUserMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                저장
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
                취소
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              이름
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{user.name || '-'}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              이메일
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{user.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4" />
              전화번호
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{user.phone || '-'}</p>
            )}
          </div>

          {/* Subscription Tier */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">구독 등급</label>
            {isEditing ? (
              <select
                value={formData.subscription_tier}
                onChange={(e) => setFormData({ ...formData, subscription_tier: e.target.value as 'FREE' | 'PREMIUM' | 'BUSINESS' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="FREE">무료</option>
                <option value="PREMIUM">프리미엄</option>
                <option value="BUSINESS">비즈니스</option>
              </select>
            ) : (
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user.subscription_tier === 'BUSINESS'
                    ? 'bg-purple-100 text-purple-700'
                    : user.subscription_tier === 'PREMIUM'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.subscription_tier === 'BUSINESS'
                  ? '비즈니스'
                  : user.subscription_tier === 'PREMIUM'
                  ? '프리미엄'
                  : '무료'}
              </span>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">계정 상태</label>
            {isEditing ? (
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="suspended">정지</option>
              </select>
            ) : (
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : user.status === 'suspended'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.status === 'active' ? '활성' : user.status === 'suspended' ? '정지' : '비활성'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="space-y-6">
        {/* User Stats */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">통계</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">명함 수</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{user.card_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">부가명함 수</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{user.sidejob_count || 0}</p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 정보</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">가입일</p>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(user.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">최근 수정일</p>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(user.updated_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
