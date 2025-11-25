import { useEffect, useState } from 'react'
import { loadBusinessCardData, defaultDemoData, type CardData } from '../../lib/cardDataLoader'
import { supabase } from '../../lib/supabase'
import { trackDownload } from '../../lib/trackDownload'
import { MapPreview } from '../MapPreview'
import type { Attachment } from '@/types/attachment'

export function SimpleCard({ userId }: { userId: string }) {
  const [cardData, setCardData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [businessCardId, setBusinessCardId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

  const getYouTubeVideoId = (url: string): string => {
    if (!url) return ''

    try {
      const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)
      if (embedMatch) return embedMatch[1]

      const urlObj = new URL(url)

      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtube-nocookie.com')) {
        const videoId = urlObj.searchParams.get('v')
        if (videoId) return videoId

        const shortsMatch = urlObj.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/)
        if (shortsMatch) return shortsMatch[1]

        const pathMatch = urlObj.pathname.match(/\/embed\/([a-zA-Z0-9_-]+)/)
        if (pathMatch) return pathMatch[1]
      }

      if (urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.pathname.slice(1).split('?')[0]
        if (videoId) return videoId
      }

      return ''
    } catch {
      const regexMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
      return regexMatch ? regexMatch[1] : ''
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
        try {
          const { data: attachmentsData } = await supabase
            .from('card_attachments' as any)
            .select('*')
            .eq('business_card_id', data.id)
            .order('display_order', { ascending: true })

          if (attachmentsData) {
            setAttachments((attachmentsData as any) || [])
          }
        } catch (error) {
          console.error('Error loading attachments:', error)
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-gray-400">로딩중...</div>
      </div>
    )
  }

  if (!cardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-red-500">데이터를 불러올 수 없습니다</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-md mx-auto px-6 py-12">
        {/* Simple Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Profile Image */}
          <div className="text-center mb-6">
            <div className="inline-block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-3xl font-semibold text-gray-600 overflow-hidden">
                {cardData.profileImage ? (
                  <img
                    src={cardData.profileImage}
                    alt={cardData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  cardData.name.charAt(0)
                )}
              </div>
            </div>
          </div>

          {/* Name & Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-1 truncate">{cardData.name}</h1>
            <p className="text-gray-500 truncate">{cardData.title}</p>
            {cardData.company && (
              <p className="text-sm text-gray-400 mt-1 truncate">{cardData.company}</p>
            )}
          </div>

          {/* Divider */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 mx-auto mb-6"></div>
        </div>

        {/* Introduction */}
        {cardData.introduction && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">소개</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{cardData.introduction}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">연락처</h2>
          <div className="space-y-3">
            <a
              href={`tel:${cardData.phone}`}
              className="flex items-center gap-3 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <span className="text-lg flex-shrink-0">📞</span>
              <span className="text-sm truncate">{cardData.phone}</span>
            </a>

            <a
              href={`mailto:${cardData.email}`}
              className="flex items-center gap-3 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <span className="text-lg flex-shrink-0">✉️</span>
              <span className="text-sm truncate">{cardData.email}</span>
            </a>

            {cardData.website && (
              <a
                href={cardData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <span className="text-lg flex-shrink-0">🌐</span>
                <span className="text-sm truncate">{cardData.website?.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </div>

        {/* SNS Links */}
        {(cardData.linkedin || cardData.instagram || cardData.facebook || cardData.twitter || cardData.youtube || cardData.github) && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">SNS</h2>
            <div className="flex flex-wrap gap-2">
              {cardData.linkedin && (
                <a
                  href={cardData.linkedin.startsWith('http') ? cardData.linkedin : `https://linkedin.com/in/${cardData.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-[#0A66C2] text-white rounded-full text-sm hover:opacity-90 transition-opacity"
                >
                  🔗 LinkedIn
                </a>
              )}
              {cardData.instagram && (
                <a
                  href={cardData.instagram.startsWith('http') ? cardData.instagram : `https://instagram.com/${cardData.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-full text-sm hover:opacity-90 transition-opacity"
                >
                  📷 Instagram
                </a>
              )}
              {cardData.facebook && (
                <a
                  href={cardData.facebook.startsWith('http') ? cardData.facebook : `https://facebook.com/${cardData.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-[#1877F2] text-white rounded-full text-sm hover:opacity-90 transition-opacity"
                >
                  📘 Facebook
                </a>
              )}
              {cardData.twitter && (
                <a
                  href={cardData.twitter.startsWith('http') ? cardData.twitter : `https://twitter.com/${cardData.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-full text-sm hover:opacity-90 transition-opacity"
                >
                  🐦 X
                </a>
              )}
              {cardData.youtube && (
                <a
                  href={cardData.youtube.startsWith('http') ? cardData.youtube : `https://youtube.com/@${cardData.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-[#FF0000] text-white rounded-full text-sm hover:opacity-90 transition-opacity"
                >
                  ▶️ YouTube
                </a>
              )}
              {cardData.github && (
                <a
                  href={cardData.github.startsWith('http') ? cardData.github : `https://github.com/${cardData.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-[#181717] text-white rounded-full text-sm hover:opacity-90 transition-opacity"
                >
                  💻 GitHub
                </a>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => window.location.href = `tel:${cardData.phone}`}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            전화하기
          </button>
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
            className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all"
          >
            연락처 저장
          </button>
        </div>

        {/* Services */}
        {cardData.services && cardData.services.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">제공 서비스</h2>
            <div className="flex flex-wrap gap-2">
              {cardData.services.map((service, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full text-sm text-gray-600"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Address & Map */}
        {cardData.address && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">주소</h2>

            {/* Speech bubble style address */}
            <div className="mb-4">
              <div className="relative bg-white border-2 border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 inline-block max-w-[85%] shadow-sm">
                <p className="text-sm text-gray-700 leading-relaxed break-words text-left">📍 {cardData.address}{cardData.address_detail ? ` ${cardData.address_detail}` : ''}</p>
              </div>
            </div>

            {cardData.latitude && cardData.longitude && (
              <div className="rounded-xl overflow-hidden shadow-md">
                <MapPreview
                  latitude={cardData.latitude}
                  longitude={cardData.longitude}
                  address={cardData.address}
                  height="220px"
                  level={4}
                />
              </div>
            )}
          </div>
        )}

        {/* Introduction Materials (Attachments) */}
        {attachments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">소개자료 ({attachments.length})</h2>
            <div className="space-y-3">
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

                const canPreview = isYouTube || isImage || isVideo

                // YouTube inline 표시
                if (isInlineYouTube && attachment.youtube_url) {
                  const videoId = getYouTubeVideoId(attachment.youtube_url)
                  const isPlaying = playingVideoId === attachment.id

                  return (
                    <div key={attachment.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-lg">{icon}</span>
                        <p className="text-sm font-medium">{attachment.title}</p>
                      </div>

                      <div
                        className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-blue-200 bg-gray-100 group cursor-pointer"
                        onClick={() => {
                          if (!isPlaying) {
                            setPlayingVideoId(attachment.id)
                          }
                        }}
                      >
                        {!isPlaying ? (
                          <>
                            <img
                              src={getYouTubeThumbnail(attachment.youtube_url)}
                              alt={attachment.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                                <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-80 rounded text-xs text-white">
                              YouTube
                            </div>
                          </>
                        ) : (
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
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
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
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-all transform hover:scale-105 whitespace-nowrap"
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

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <img src="/assets/GP 로고.png" alt="G-PLAT" className="w-4 h-4 opacity-50" />
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
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .max-w-md {
            max-width: 85.6mm;
            margin: 0 auto;
            padding: 5mm;
          }

          .bg-white {
            box-shadow: none !important;
            border: 1px solid #e5e7eb;
          }

          button {
            display: none;
          }

          body {
            background: white;
          }
        }
      `}</style>
    </div>
  )
}