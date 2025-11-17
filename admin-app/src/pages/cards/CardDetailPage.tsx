import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Edit,
  Eye,
  Trash2,
  QrCode,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  MapPin
} from 'lucide-react'
import { fetchCard, fetchCardDetailStats } from '@/lib/api/cards'
import { ViewsChart } from '@/components/stats/ViewsChart'
import { DeviceChart } from '@/components/stats/DeviceChart'
import { BrowserChart } from '@/components/stats/BrowserChart'
import { VisitorsTable } from '@/components/stats/VisitorsTable'
import { CardEditModal } from '@/components/cards/CardEditModal'

export function CardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'qr' | 'visitors'>('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Fetch card data
  const { data: card, isLoading: cardLoading, error: cardError, refetch: refetchCard } = useQuery({
    queryKey: ['card', id],
    queryFn: () => fetchCard(id!),
    enabled: !!id
  })

  // Fetch card statistics
  const { data: stats } = useQuery({
    queryKey: ['cardStats', id],
    queryFn: () => fetchCardDetailStats(id!),
    enabled: !!id
  })

  if (cardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (cardError || !card) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">명함을 찾을 수 없습니다</p>
          <button
            onClick={() => navigate('/cards')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            명함 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const getThemeName = (theme: string | null) => {
    switch (theme) {
      case 'trendy': return '트렌디'
      case 'apple': return '애플'
      case 'professional': return '프로페셔널'
      case 'simple': return '심플'
      default: return '기본'
    }
  }

  const getThemeColor = (theme: string | null) => {
    switch (theme) {
      case 'trendy': return 'from-purple-500 to-pink-600'
      case 'apple': return 'from-gray-700 to-gray-900'
      case 'professional': return 'from-blue-600 to-blue-800'
      case 'simple': return 'from-green-500 to-teal-600'
      default: return 'from-indigo-500 to-purple-600'
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/cards')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>명함 목록으로</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{card.name} 명함</h1>
            <p className="text-gray-600 mt-1">
              {card.users?.name} ({card.users?.email})
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href={`https://g-plat.com/card/${card.custom_url || card.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <Eye className="w-4 h-4" />
              미리보기
            </a>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <Edit className="w-4 h-4" />
              편집
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <QrCode className="w-4 h-4" />
              QR 생성
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          {[
            { key: 'overview', label: '개요' },
            { key: 'stats', label: '통계' },
            { key: 'qr', label: 'QR 코드' },
            { key: 'visitors', label: '방문자' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`pb-4 px-2 font-medium transition ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">이름</label>
                  <p className="text-gray-900 mt-1">{card.name}</p>
                </div>
                {card.title && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">직함</label>
                    <p className="text-gray-900 mt-1">{card.title}</p>
                  </div>
                )}
                {card.company && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">회사</label>
                    <p className="text-gray-900 mt-1">{card.company}</p>
                  </div>
                )}
                {card.department && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">부서</label>
                    <p className="text-gray-900 mt-1">{card.department}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">연락처 정보</h2>

              <div className="space-y-3">
                {card.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{card.phone}</span>
                  </div>
                )}
                {card.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{card.email}</span>
                  </div>
                )}
                {card.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a
                      href={card.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {card.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {card.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {card.address}
                      {card.address_detail && ` ${card.address_detail}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {card.bio && (
              <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">소개</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{card.bio}</p>
              </div>
            )}

            {/* Social Links */}
            {(card.linkedin || card.instagram || card.facebook || card.twitter || card.youtube || card.github) && (
              <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">소셜 링크</h2>
                <div className="flex flex-wrap gap-3">
                  {card.linkedin && (
                    <a
                      href={card.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                    >
                      LinkedIn
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {card.instagram && (
                    <a
                      href={card.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition"
                    >
                      Instagram
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {card.facebook && (
                    <a
                      href={card.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                    >
                      Facebook
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {card.twitter && (
                    <a
                      href={card.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition"
                    >
                      Twitter
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {card.youtube && (
                    <a
                      href={card.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      YouTube
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {card.github && (
                    <a
                      href={card.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    >
                      GitHub
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Theme Preview */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">테마</h3>
              <div className={`w-full h-32 bg-gradient-to-br ${getThemeColor(card.theme)} rounded-lg flex items-center justify-center text-white font-semibold text-lg`}>
                {getThemeName(card.theme)}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">통계 요약</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">총 조회수</span>
                  <span className="font-semibold text-gray-900">
                    {stats?.total_views?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">QR 스캔</span>
                  <span className="font-semibold text-gray-900">
                    {stats?.total_qr_scans?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">부가 명함</span>
                  <span className="font-semibold text-gray-900">
                    {stats?.total_sidejobs?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">상태</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">활성 상태</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    card.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {card.is_active ? '활성' : '비활성'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">생성일</span>
                  <span className="text-sm text-gray-900">
                    {new Date(card.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">수정일</span>
                  <span className="text-sm text-gray-900">
                    {new Date(card.updated_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom URL */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">커스텀 URL</h3>
              <div className="bg-gray-50 rounded-lg p-3 break-all">
                <code className="text-sm text-gray-700">
                  g-plat.com/card/{card.custom_url}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Views Trend Chart */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">일별 조회수 추이</h3>
            <ViewsChart data={stats?.views_by_day || []} />
          </div>

          {/* Device and Browser Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">디바이스별 분포</h3>
              <DeviceChart data={stats?.views_by_device || []} />
            </div>
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">브라우저별 분포</h3>
              <BrowserChart data={stats?.views_by_browser || []} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'qr' && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">QR 코드 목록 구현 예정</p>
        </div>
      )}

      {activeTab === 'visitors' && (
        <div className="bg-white rounded-xl shadow border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">최근 방문자</h3>
            <p className="text-sm text-gray-500 mt-1">최근 50명의 방문자 정보</p>
          </div>
          <VisitorsTable data={stats?.recent_visitors || []} />
        </div>
      )}

      {/* Edit Modal */}
      {card && (
        <CardEditModal
          card={card}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            refetchCard()
            alert('명함이 성공적으로 수정되었습니다')
          }}
        />
      )}
    </div>
  )
}
