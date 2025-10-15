import { useEffect, useState } from 'react'
import { loadBusinessCardData, defaultDemoData, type CardData } from '../../lib/cardDataLoader'
import { supabase } from '../../lib/supabase'
import { trackDownload } from '../../lib/trackDownload'

interface Attachment {
  id: string
  title: string
  filename?: string
  file_url?: string
  file_size?: number
  file_type?: string
  youtube_url?: string
  attachment_type: 'file' | 'youtube'
  display_order: number
}

export function DefaultCard({ userId }: { userId: string }) {
  const [cardData, setCardData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [visitors, setVisitors] = useState({ today: 0, total: 0 })
  const [businessCardId, setBusinessCardId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      let videoId = ''
      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v') || ''
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1)
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    } catch {
      return url
    }
  }

  useEffect(() => {
    loadCardData()
    trackVisitor()
  }, [userId])

  const loadCardData = async () => {
    try {
      const data = await loadBusinessCardData(userId)
      setCardData(data || defaultDemoData)

      // Load attachments from card_attachments table
      if (data?.id) {
        setBusinessCardId(data.id)
        const { data: attachmentsData } = await supabase
          .from('card_attachments')
          .select('*')
          .eq('business_card_id', data.id)
          .order('display_order', { ascending: true })

        if (attachmentsData) {
          setAttachments(attachmentsData)
        }
      }
    } catch (error) {
      console.error('Error loading card data:', error)
      setCardData(defaultDemoData)
    } finally {
      setLoading(false)
    }
  }

  const trackVisitor = async () => {
    try {
      // Track visitor
      await supabase.from('visitor_stats').insert({
        user_id: userId,
        visited_at: new Date().toISOString()
      })

      // Get visitor stats
      const today = new Date().toISOString().split('T')[0]
      const { data: todayStats } = await supabase
        .from('visitor_stats')
        .select('id')
        .eq('user_id', userId)
        .gte('visited_at', today)

      const { data: totalStats } = await supabase
        .from('visitor_stats')
        .select('id')
        .eq('user_id', userId)

      setVisitors({
        today: todayStats?.length || 0,
        total: totalStats?.length || 0
      })
    } catch (error) {
      console.error('Error tracking visitor:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-purple-400">로딩중...</div>
      </div>
    )
  }

  if (!cardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-red-500">데이터를 불러올 수 없습니다</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-400 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-md mx-auto px-6 py-8">
        {/* Visitor Stats Banner */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 flex items-center justify-between text-sm">
          <span className="text-gray-600">👁 오늘 {visitors.today}명</span>
          <span className="text-gray-600">총 {visitors.total}명 방문</span>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {cardData.profileImage ? (
                    <img
                      src={cardData.profileImage}
                      alt={cardData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {cardData.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              {/* Status Dot */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">{cardData.name}</h1>
            <p className="text-lg text-purple-600 font-medium mb-1">{cardData.title}</p>
            {cardData.company && (
              <p className="text-gray-500">{cardData.company}</p>
            )}
          </div>
        </div>

        {/* Introduction */}
        {cardData.introduction && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📝</span> 소개
            </h2>
            <p className="text-gray-600 leading-relaxed">{cardData.introduction}</p>
          </div>
        )}

        {/* Contact Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📞</span> 연락처
          </h2>

          <div className="space-y-3">
            <a
              href={`tel:${cardData.phone}`}
              className="block p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{cardData.phone}</span>
                <span className="text-purple-500">전화 →</span>
              </div>
            </a>

            <a
              href={`mailto:${cardData.email}`}
              className="block p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{cardData.email}</span>
                <span className="text-blue-500">메일 →</span>
              </div>
            </a>

            {cardData.website && (
              <a
                href={cardData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl hover:from-pink-100 hover:to-orange-100 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">{cardData.website.replace(/^https?:\/\//, '')}</span>
                  <span className="text-pink-500">방문 →</span>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => window.location.href = `tel:${cardData.phone}`}
            className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all hover:scale-105"
          >
            <span className="block text-2xl mb-1">📞</span>
            <span className="text-xs text-gray-600">전화</span>
          </button>
          <button
            onClick={() => window.location.href = `sms:${cardData.phone}`}
            className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all hover:scale-105"
          >
            <span className="block text-2xl mb-1">💬</span>
            <span className="text-xs text-gray-600">문자</span>
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${cardData.name}의 명함`,
                  text: `${cardData.name} - ${cardData.title}\n${cardData.phone}`,
                  url: window.location.href
                })
              }
            }}
            className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all hover:scale-105"
          >
            <span className="block text-2xl mb-1">🔗</span>
            <span className="text-xs text-gray-600">공유</span>
          </button>
        </div>

        {/* Services */}
        {cardData.services && cardData.services.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💼</span> 제공 서비스
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {cardData.services.map((service, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl text-center"
                >
                  <span className="text-sm text-gray-700">{service}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Introduction Materials (Attachments) */}
        {attachments.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📎</span> 소개자료 ({attachments.length})
            </h2>
            <div className="space-y-3">
              {attachments.map((attachment) => {
                const isYouTube = attachment.attachment_type === 'youtube'
                const isImage = attachment.file_type?.startsWith('image/')
                const isVideo = attachment.file_type?.startsWith('video/')
                const isPDF = attachment.file_type === 'application/pdf'

                let icon = '📎'
                if (isYouTube) icon = '▶️'
                else if (isImage) icon = '🖼️'
                else if (isVideo) icon = '🎬'
                else if (isPDF) icon = '📄'

                const canPreview = isYouTube || isImage || isVideo

                return (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xl flex-shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 font-medium text-sm truncate">{attachment.title}</p>
                        {!isYouTube && attachment.filename && (
                          <p className="text-gray-500 text-xs mt-0.5 truncate">{attachment.filename}</p>
                        )}
                        {isYouTube && (
                          <p className="text-gray-500 text-xs mt-0.5">YouTube 영상</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3 flex-shrink-0">
                      {canPreview && (
                        <button
                          onClick={() => setPreviewAttachment(attachment)}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-all whitespace-nowrap"
                        >
                          미리보기
                        </button>
                      )}
                      {!isYouTube && attachment.file_url && (
                        <a
                          href={attachment.file_url}
                          download={attachment.filename}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            if (businessCardId) {
                              trackDownload({
                                attachmentId: attachment.id,
                                businessCardId: businessCardId
                              })
                            }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all transform hover:scale-105 whitespace-nowrap"
                        >
                          다운로드
                        </a>
                      )}
                      {isYouTube && attachment.youtube_url && (
                        <a
                          href={attachment.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-all whitespace-nowrap"
                        >
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Save Contact Button */}
        <button
          onClick={() => {
            const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.name}
ORG:${cardData.company}
TEL:${cardData.phone}
EMAIL:${cardData.email}
END:VCARD`
            const blob = new Blob([vcard], { type: 'text/vcard' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${cardData.name}.vcf`
            a.click()
          }}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          📱 연락처 저장하기
        </button>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <img src="/assets/GP 로고.png" alt="G-PLAT" className="w-5 h-5" />
            <span className="text-sm">G-PLAT 모바일 명함</span>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewAttachment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                {previewAttachment.title}
              </h3>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 5rem)' }}>
              {previewAttachment.attachment_type === 'youtube' && previewAttachment.youtube_url && (
                <div className="w-full aspect-video">
                  <iframe
                    src={getYouTubeEmbedUrl(previewAttachment.youtube_url)}
                    className="w-full h-full rounded-lg"
                    title={previewAttachment.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {previewAttachment.file_type?.startsWith('image/') && previewAttachment.file_url && (
                <img
                  src={previewAttachment.file_url}
                  alt={previewAttachment.title}
                  className="w-full h-auto rounded-lg"
                />
              )}
              {previewAttachment.file_type?.startsWith('video/') && previewAttachment.file_url && (
                <video
                  src={previewAttachment.file_url}
                  controls
                  className="w-full h-auto rounded-lg"
                >
                  브라우저가 비디오를 지원하지 않습니다.
                </video>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}