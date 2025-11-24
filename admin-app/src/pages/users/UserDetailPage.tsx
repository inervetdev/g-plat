import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, CreditCard, QrCode, Activity, DollarSign, Shield } from 'lucide-react'
import { useUser } from '@/hooks/useUsers'
import { UserInfoTab } from '@/components/users/detail/UserInfoTab'
import { UserCardsTab } from '@/components/users/detail/UserCardsTab'
import { UserSideJobsTab } from '@/components/users/detail/UserSideJobsTab'
import { UserQRTab } from '@/components/users/detail/UserQRTab'
import { UserActivityTab } from '@/components/users/detail/UserActivityTab'
import { UserPaymentTab } from '@/components/users/detail/UserPaymentTab'
import { UserStatusModal } from '@/components/users/UserStatusModal'

type TabType = 'info' | 'cards' | 'sidejob' | 'qr' | 'activity' | 'payment'

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  const { data: user, isLoading, error, refetch } = useUser(userId || '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-medium">사용자 정보를 불러올 수 없습니다</p>
          <p className="text-gray-500 text-sm mt-2">{error?.message || '사용자를 찾을 수 없습니다'}</p>
          <button
            onClick={() => navigate('/users')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            사용자 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'info', label: '기본 정보', icon: User },
    { id: 'cards', label: '명함 목록', icon: CreditCard },
    { id: 'sidejob', label: '부가명함', icon: CreditCard },
    { id: 'qr', label: 'QR 코드', icon: QrCode },
    { id: 'activity', label: '활동 로그', icon: Activity },
    { id: 'payment', label: '결제 내역', icon: DollarSign },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          사용자 목록으로 돌아가기
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                {/* 삭제 대상이면 "삭제대기"만 표시, 그 외에는 기존 상태 표시 */}
                {user.deleted_at ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    삭제대기
                  </span>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Shield className="w-5 h-5" />
              상태 변경
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 pb-4 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'info' && <UserInfoTab user={user} />}
        {activeTab === 'cards' && <UserCardsTab userId={user.id} />}
        {activeTab === 'sidejob' && <UserSideJobsTab userId={user.id} />}
        {activeTab === 'qr' && <UserQRTab userId={user.id} />}
        {activeTab === 'activity' && <UserActivityTab userId={user.id} />}
        {activeTab === 'payment' && <UserPaymentTab />}
      </div>

      {/* Status Change Modal */}
      <UserStatusModal
        user={user}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={() => {
          // If user was deleted, navigate to users list
          // Otherwise just refetch
          refetch().catch(() => {
            navigate('/users')
          })
        }}
      />
    </div>
  )
}
