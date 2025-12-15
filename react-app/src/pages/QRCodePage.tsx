import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import QRCodeGenerator from '../components/QRCodeGenerator'
import { ArrowLeft, Eye } from 'lucide-react'

interface BusinessCard {
  id: string
  user_id: string
  name: string
  title: string
  company: string
  custom_url?: string
  view_count: number
}

export default function QRCodePage() {
  const { cardId } = useParams<{ cardId: string }>()
  const navigate = useNavigate()
  const [card, setCard] = useState<BusinessCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrStats, setQrStats] = useState<any>(null)

  useEffect(() => {
    if (cardId) {
      loadCardData()
      loadQRStats()
    }
  }, [cardId])

  const loadCardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data: cardData, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('id', cardId || '')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading card:', error)
        navigate('/dashboard')
        return
      }

      setCard(cardData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadQRStats = async () => {
    try {
      const { data: stats, error } = await supabase
        .from('qr_codes')
        .select(`
          *,
          qr_scans(count)
        `)
        .eq('business_card_id', cardId || '')
        .order('created_at', { ascending: false })

      if (!error && stats) {
        setQrStats(stats)
      }
    } catch (error) {
      console.error('Error loading QR stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">명함을 찾을 수 없습니다</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const cardUrl = card.custom_url
    ? `${window.location.origin}/card/${card.custom_url}`
    : `${window.location.origin}/card/${card.id}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">QR 코드 관리</h1>
                <p className="text-sm text-gray-600">{card.name} - {card.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/card/${card.id}`)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                명함 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Generator */}
          <div>
            <QRCodeGenerator
              url={cardUrl}
              title="명함 QR 코드"
              businessCardId={card.id}
              enableTracking={true}
            />
          </div>

          {/* QR Statistics */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">QR 코드 통계</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">총 스캔</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {qrStats?.reduce((sum: number, qr: any) => sum + (qr.qr_scans?.[0]?.count || 0), 0) || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">활성 QR</p>
                  <p className="text-2xl font-bold text-green-800">
                    {qrStats?.filter((qr: any) => qr.is_active).length || 0}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 mb-1">명함 조회수</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {card.view_count || 0}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600 mb-1">전환율</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {card.view_count > 0
                      ? Math.round((qrStats?.reduce((sum: number, qr: any) => sum + (qr.qr_scans?.[0]?.count || 0), 0) / card.view_count) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Recent QR Codes */}
            {qrStats && qrStats.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">생성된 QR 코드 목록</h3>
                <div className="space-y-3">
                  {qrStats.map((qr: any) => (
                    <div key={qr.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            QR 코드 #{qr.short_code}
                          </p>
                          <p className="text-xs text-gray-500">
                            생성: {new Date(qr.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            단축 URL: /q/{qr.short_code}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {qr.qr_scans?.[0]?.count || 0} 스캔
                          </p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            qr.is_active
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {qr.is_active ? '활성' : '비활성'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 QR 코드 활용 팁</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• 명함에 QR 코드를 인쇄하여 오프라인에서 활용하세요</li>
                <li>• 이메일 서명에 QR 코드를 추가하여 접근성을 높이세요</li>
                <li>• 각 캠페인별로 다른 QR 코드를 생성하여 성과를 측정하세요</li>
                <li>• 동적 QR 코드로 목적지 URL을 언제든 변경할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}