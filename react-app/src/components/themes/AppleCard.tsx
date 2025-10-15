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
  youtube_display_mode?: 'modal' | 'inline'
  attachment_type: 'file' | 'youtube'
  display_order: number
}

export function AppleCard({ userId }: { userId: string }) {
  const [cardData, setCardData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [businessCardId, setBusinessCardId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

  const getYouTubeVideoId = (url: string): string => {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v') || ''
      } else if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1)
      }
      return ''
    } catch {
      return ''
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url)
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url
  }

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
  }

  useEffect(() => {
    loadCardData()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-400">로딩중...</div>
      </div>
    )
  }

  if (!cardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-500">데이터를 불러올 수 없습니다</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}>
      {/* iOS-style Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button className="text-blue-500 text-base">편집</button>
          <h1 className="text-base font-semibold">연락처</h1>
          <button className="text-blue-500 text-base">공유</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <div className="bg-white px-4 py-8 text-center">
          <div className="inline-block mb-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-5xl text-gray-500 overflow-hidden">
              {cardData.profileImage ? (
                <img
                  src={cardData.profileImage}
                  alt={cardData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-light">{cardData.name.charAt(0)}</span>
              )}
            </div>
          </div>
          <h2 className="text-2xl font-normal mb-1">{cardData.name}</h2>
          <p className="text-gray-500 text-base">{cardData.title}</p>
          {cardData.company && (
            <p className="text-gray-500 text-sm mt-1">{cardData.company}</p>
          )}
        </div>

        {/* Introduction */}
        {cardData.introduction && (
          <div className="mt-2 bg-white">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium">소개</h3>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-600 leading-relaxed">{cardData.introduction}</p>
            </div>
          </div>
        )}

        {/* Contact List */}
        <div className="mt-2 bg-white">
          <div className="px-4">
            {/* Phone */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">휴대폰</p>
                <p className="text-blue-500">{cardData.phone}</p>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">이메일</p>
                <p className="text-blue-500">{cardData.email}</p>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </div>

            {/* Website */}
            {cardData.website && (
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">웹사이트</p>
                  <p className="text-blue-500">{cardData.website.replace(/^https?:\/\//, '')}</p>
                </div>
                <span className="text-gray-300 text-xl">›</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white px-4 py-4 mt-2">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => window.location.href = `tel:${cardData.phone}`}
              className="flex flex-col items-center gap-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                📞
              </div>
              <span className="text-xs text-gray-600">전화</span>
            </button>
            <button
              onClick={() => window.location.href = `sms:${cardData.phone}`}
              className="flex flex-col items-center gap-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-lg">
                💬
              </div>
              <span className="text-xs text-gray-600">메시지</span>
            </button>
            <button
              onClick={() => window.location.href = `mailto:${cardData.email}`}
              className="flex flex-col items-center gap-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                ✉️
              </div>
              <span className="text-xs text-gray-600">메일</span>
            </button>
          </div>
        </div>

        {/* Services */}
        {cardData.services && cardData.services.length > 0 && (
          <div className="mt-2 bg-white">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium">제공 서비스</h3>
            </div>
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                {cardData.services.map((service, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-gray-50 text-center"
                  >
                    <span className="text-sm text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Introduction Materials (Attachments) */}
        {attachments.length > 0 && (
          <div className="mt-2 bg-white">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium">소개자료 ({attachments.length})</h3>
            </div>
            <div className="px-4 py-3 space-y-3">
              {attachments.map((attachment) => {
                const isYouTube = attachment.attachment_type === 'youtube'
                const isInlineYouTube = isYouTube && attachment.youtube_display_mode === 'inline'
                const isImage = attachment.file_type?.startsWith('image/')
                const isVideo = attachment.file_type?.startsWith('video/')
                const isPDF = attachment.file_type === 'application/pdf'

                let icon = '📎'
                if (isYouTube) icon = '▶️'
                else if (isImage) icon = '🖼️'
                else if (isVideo) icon = '🎬'
                else if (isPDF) icon = '📄'

                const canPreview = isYouTube || isImage || isVideo || isPDF

                // YouTube inline 표시 (카드 UI)
                if (isInlineYouTube && attachment.youtube_url) {
                  const videoId = getYouTubeVideoId(attachment.youtube_url)
                  const isPlaying = playingVideoId === attachment.id

                  return (
                    <div key={attachment.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-lg">{icon}</span>
                        <p className="text-sm font-medium">{attachment.title}</p>
                      </div>

                      {/* YouTube 카드 */}
                      <div
                        className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group cursor-pointer"
                        onClick={() => {
                          if (!isPlaying) {
                            setPlayingVideoId(attachment.id)
                          }
                        }}
                      >
                        {!isPlaying ? (
                          <>
                            {/* 썸네일 */}
                            <img
                              src={getYouTubeThumbnail(attachment.youtube_url)}
                              alt={attachment.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                              }}
                            />

                            {/* 재생 오버레이 */}
                            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>

                            {/* YouTube 배지 */}
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-80 rounded text-xs text-white">
                              YouTube
                            </div>
                          </>
                        ) : (
                          /* 재생 중 - iframe */
                          <iframe
                            src={getYouTubeEmbedUrl(attachment.youtube_url)}
                            className="w-full h-full"
                            title={attachment.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-lg flex-shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 font-normal text-sm truncate">{attachment.title}</p>
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
                          download={isPDF ? undefined : attachment.filename}
                          onClick={(e) => {
                            if (businessCardId) {
                              trackDownload({
                                attachmentId: attachment.id,
                                businessCardId: businessCardId
                              })
                            }
                            // PDF는 새 탭에서 열기
                            if (isPDF) {
                              e.preventDefault()
                              window.open(attachment.file_url, '_blank')
                            }
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-all whitespace-nowrap"
                        >
                          {isPDF ? '열기' : '다운로드'}
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

        {/* Add to Contacts Button */}
        <div className="px-4 py-6">
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
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            연락처에 추가
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <img src="/assets/GP 로고.png" alt="G-PLAT" className="w-5 h-5 opacity-50" />
            <span className="text-xs">Powered by G-PLAT</span>
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
              {previewAttachment.file_type === 'application/pdf' && previewAttachment.file_url && (
                <div className="w-full" style={{ height: 'calc(90vh - 10rem)' }}>
                  <iframe
                    src={previewAttachment.file_url}
                    className="w-full h-full rounded-lg"
                    title={previewAttachment.title}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}