import { useState } from 'react'
import { Edit2, Save, X, Calendar, Mail, Phone, Trash2, RotateCcw, Star, Crown, Zap } from 'lucide-react'
import { useUpdateUser, useDeleteUser } from '@/hooks/useUsers'
import type { UserWithStats } from '@/types/admin'

// 등급별 제한 상수
const TIER_LIMITS = {
  FREE: { maxCards: 3, maxSidejobs: 5, name: '무료' },
  PREMIUM: { maxCards: 10, maxSidejobs: 30, name: '프리미엄' },
  BUSINESS: { maxCards: 999999, maxSidejobs: 999999, name: '비즈니스' },
}

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
    grandfathered: boolean
  }>({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    subscription_tier: user.subscription_tier || 'FREE',
    status: (user.status as 'active' | 'inactive' | 'suspended') || 'active',
    grandfathered: user.grandfathered || false,
  })

  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const handlePermanentDelete = async () => {
    if (!confirm(`정말로 사용자를 완전히 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 사용자의 모든 데이터(명함, 부가명함, QR 코드 등)가 영구적으로 삭제됩니다.`)) {
      return
    }

    try {
      await deleteUserMutation.mutateAsync({
        userId: user.id,
        permanent: true,
      })
      alert('사용자가 완전히 삭제되었습니다')
      window.location.href = '/users'
    } catch (error) {
      console.error('Failed to permanently delete user:', error)
      alert('완전 삭제에 실패했습니다')
    }
  }

  const handleRestore = async () => {
    if (!confirm('사용자를 복구하시겠습니까?\n\n삭제대기 상태가 해제되고 활성 상태로 변경됩니다.')) {
      return
    }

    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        data: {
          status: 'active',
          deleted_at: null,
          deletion_reason: null,
        },
      })
      alert('사용자가 복구되었습니다')
      window.location.reload()
    } catch (error) {
      console.error('Failed to restore user:', error)
      alert('복구에 실패했습니다')
    }
  }

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
      grandfathered: user.grandfathered || false,
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
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    user.subscription_tier === 'BUSINESS'
                      ? 'bg-purple-100 text-purple-700'
                      : user.subscription_tier === 'PREMIUM'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {user.subscription_tier === 'BUSINESS' ? (
                    <Crown className="w-3.5 h-3.5" />
                  ) : user.subscription_tier === 'PREMIUM' ? (
                    <Zap className="w-3.5 h-3.5" />
                  ) : null}
                  {user.subscription_tier === 'BUSINESS'
                    ? '비즈니스'
                    : user.subscription_tier === 'PREMIUM'
                    ? '프리미엄'
                    : '무료'}
                </span>
                {user.grandfathered && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <Star className="w-3 h-3" />
                    얼리어답터
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Grandfathered Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              얼리어답터 특별 혜택
            </label>
            {isEditing ? (
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.grandfathered}
                    onChange={(e) => setFormData({ ...formData, grandfathered: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
                <span className="text-sm text-gray-600">
                  {formData.grandfathered ? '활성화됨 (등급 제한 무시)' : '비활성화'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {user.grandfathered ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    <Star className="w-4 h-4" />
                    등급 제한 무시 (얼리어답터 특별 혜택)
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm">일반 사용자 (등급별 제한 적용)</span>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              얼리어답터 사용자는 등급 제한에 관계없이 무제한 명함/부가명함 생성 가능
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">계정 상태</label>
            {isEditing ? (
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!user.deleted_at}
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="suspended">정지</option>
              </select>
            ) : (
              <>
                {/* 삭제 대상이면 "삭제대기"만 표시 */}
                {user.deleted_at ? (
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                    삭제대기
                  </span>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="space-y-6">
        {/* User Stats with Tier Limits */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">사용량 및 제한</h3>
          <div className="space-y-5">
            {/* Business Cards */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600">명함</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.card_count || 0}
                  {!user.grandfathered && user.subscription_tier !== 'BUSINESS' && (
                    <span className="text-gray-400">
                      {' '}/ {TIER_LIMITS[user.subscription_tier || 'FREE'].maxCards}
                    </span>
                  )}
                  {(user.grandfathered || user.subscription_tier === 'BUSINESS') && (
                    <span className="text-gray-400"> / ∞</span>
                  )}
                </p>
              </div>
              {!user.grandfathered && user.subscription_tier !== 'BUSINESS' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      ((user.card_count || 0) / TIER_LIMITS[user.subscription_tier || 'FREE'].maxCards) >= 1
                        ? 'bg-red-500'
                        : ((user.card_count || 0) / TIER_LIMITS[user.subscription_tier || 'FREE'].maxCards) >= 0.8
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min(100, ((user.card_count || 0) / TIER_LIMITS[user.subscription_tier || 'FREE'].maxCards) * 100)}%`
                    }}
                  />
                </div>
              )}
            </div>

            {/* Sidejob Cards */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600">부가명함</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.sidejob_count || 0}
                  {!user.grandfathered && user.subscription_tier !== 'BUSINESS' && (
                    <span className="text-gray-400">
                      {' '}/ {TIER_LIMITS[user.subscription_tier || 'FREE'].maxSidejobs}
                    </span>
                  )}
                  {(user.grandfathered || user.subscription_tier === 'BUSINESS') && (
                    <span className="text-gray-400"> / ∞</span>
                  )}
                </p>
              </div>
              {!user.grandfathered && user.subscription_tier !== 'BUSINESS' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      ((user.sidejob_count || 0) / TIER_LIMITS[user.subscription_tier || 'FREE'].maxSidejobs) >= 1
                        ? 'bg-red-500'
                        : ((user.sidejob_count || 0) / TIER_LIMITS[user.subscription_tier || 'FREE'].maxSidejobs) >= 0.8
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min(100, ((user.sidejob_count || 0) / TIER_LIMITS[user.subscription_tier || 'FREE'].maxSidejobs) * 100)}%`
                    }}
                  />
                </div>
              )}
            </div>

            {/* Tier Info */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {user.grandfathered ? (
                  <>⭐ 얼리어답터 혜택으로 무제한 사용 가능</>
                ) : user.subscription_tier === 'BUSINESS' ? (
                  <>👑 비즈니스 등급 무제한</>
                ) : user.subscription_tier === 'PREMIUM' ? (
                  <>명함 10개, 부가명함 30개 제한</>
                ) : (
                  <>명함 3개, 부가명함 5개 제한</>
                )}
              </p>
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

        {/* Deletion Info - 삭제 대상인 경우에만 표시 */}
        {user.deleted_at && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-4">삭제 정보</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-2">삭제대기 상태</p>
                <p className="text-sm text-orange-600">
                  이 계정은 삭제 대상으로 지정되었습니다. 로그인이 차단되며 모든 서비스 이용이 제한됩니다.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm text-orange-600">삭제 지정일</p>
                  <p className="text-sm font-medium text-orange-900 mt-1">
                    {new Date(user.deleted_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {user.deletion_reason && (
                <div>
                  <p className="text-sm text-orange-600 mb-1">삭제 사유</p>
                  <p className="text-sm font-medium text-orange-900 bg-white rounded-lg p-3 border border-orange-200">
                    {user.deletion_reason}
                  </p>
                </div>
              )}

              {/* 완전 삭제 / 복구 버튼 */}
              <div className="flex gap-3 pt-4 border-t border-orange-200">
                <button
                  onClick={handlePermanentDelete}
                  disabled={deleteUserMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  완전 삭제
                </button>
                <button
                  onClick={handleRestore}
                  disabled={updateUserMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  복구
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
