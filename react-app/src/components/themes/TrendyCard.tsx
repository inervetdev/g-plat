import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { trackDownload } from '../../lib/trackDownload'
import { MapPreview } from '../MapPreview'
import type { Attachment } from '@/types/attachment'

interface CardData {
  name: string
  title: string
  company: string
  phone: string
  email: string
  website?: string
  address?: string
  latitude?: number
  longitude?: number
  introduction?: string
  services?: string[]
  profileImage?: string
  attachments?: Attachment[]
}

export function TrendyCard({ userId }: { userId: string }) {
  const [cardData, setCardData] = useState<CardData | null>(null)
  const [businessCardId, setBusinessCardId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

  const getYouTubeVideoId = (url: string): string => {
    if (!url) return ''

    try {
      // 이미 embed URL인 경우 video ID 추출
      const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)
      if (embedMatch) return embedMatch[1]

      const urlObj = new URL(url)

      // youtube.com/watch?v=VIDEO_ID
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtube-nocookie.com')) {
        const videoId = urlObj.searchParams.get('v')
        if (videoId) return videoId

        // youtube.com/shorts/VIDEO_ID (YouTube Shorts)
        const shortsMatch = urlObj.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/)
        if (shortsMatch) return shortsMatch[1]

        // youtube.com/embed/VIDEO_ID 형식도 처리
        const pathMatch = urlObj.pathname.match(/\/embed\/([a-zA-Z0-9_-]+)/)
        if (pathMatch) return pathMatch[1]
      }

      // youtu.be/VIDEO_ID
      if (urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.pathname.slice(1).split('?')[0]
        if (videoId) return videoId
      }

      return ''
    } catch {
      // URL 파싱 실패 시 정규식으로 시도
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
      // First try to load from business_cards table
      const { data: businessCard, error: cardError } = await supabase
        .from('business_cards')
        .select('*')
        .or(`id.eq.${userId},user_id.eq.${userId},custom_url.eq.${userId}`)
        .eq('is_active', true)
        .single()

      if (businessCard && !cardError) {
        setBusinessCardId(businessCard.id)

        // Load attachments from card_attachments table
        let attachments: Attachment[] = []
        try {
          const { data: attachmentsData } = await supabase
            .from('card_attachments' as any)
            .select('*')
            .eq('business_card_id', businessCard.id)
            .order('display_order', { ascending: true })

          if (attachmentsData) {
            attachments = (attachmentsData as any) || []
          }
        } catch (error) {
          console.error('Error loading attachments:', error)
        }

        setCardData({
          name: businessCard.name,
          title: businessCard.title || '',
          company: businessCard.company || '',
          phone: businessCard.phone || '',
          email: businessCard.email || '',
          website: (businessCard as any).website || '',
          address: (businessCard as any).address || '',
          latitude: (businessCard as any).latitude,
          longitude: (businessCard as any).longitude,
          introduction: (businessCard as any).introduction || '',
          services: (businessCard as any).services || [],
          profileImage: businessCard.profile_image || '',
          attachments: attachments
        })
      } else {
        // Fallback to user data
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (userData) {
          const profile = profileData as any
          setCardData({
            name: userData.name || '김대리',
            title: profile?.title || 'Full Stack Developer',
            company: profile?.company || 'G-PLAT Tech',
            phone: (userData as any).phone || '010-1234-5678',
            email: userData.email || 'demo@gplat.com',
            website: profile?.website || 'https://gplat.com',
            introduction: profile?.introduction || '안녕하세요! 풀스택 개발자입니다. React, Node.js, TypeScript를 주로 사용하며, 모바일 명함 서비스를 개발하고 있습니다.',
            services: profile?.services || ['웹 개발', '앱 개발', 'UI/UX 디자인', '기술 컨설팅'],
            profileImage: profile?.profile_image || ''
          })
        } else {
          // 데이터가 없을 때 데모 데이터 사용
          setCardData({
            name: '김대리',
            title: 'Full Stack Developer',
            company: 'G-PLAT Tech',
            phone: '010-1234-5678',
            email: 'demo@gplat.com',
            website: 'https://gplat.com',
            introduction: '안녕하세요! 풀스택 개발자입니다. React, Node.js, TypeScript를 주로 사용하며, 모바일 명함 서비스를 개발하고 있습니다.',
            services: ['웹 개발', '앱 개발', 'UI/UX 디자인', '기술 컨설팅'],
            profileImage: ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading card data:', error)
      // 에러 시에도 데모 데이터 표시
      setCardData({
        name: '김대리',
        title: 'Full Stack Developer',
        company: 'G-PLAT Tech',
        phone: '010-1234-5678',
        email: 'demo@gplat.com',
        website: 'https://gplat.com',
        introduction: '안녕하세요! 풀스택 개발자입니다. React, Node.js, TypeScript를 주로 사용하며, 모바일 명함 서비스를 개발하고 있습니다.',
        services: ['웹 개발', '앱 개발', 'UI/UX 디자인', '기술 컨설팅'],
        profileImage: ''
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-green-400">로딩중...</div>
      </div>
    )
  }

  if (!cardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-red-400">데이터를 불러올 수 없습니다</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 animate-gradient-xy" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-md mx-auto px-6 py-12">
        {/* Profile Section */}
        <div className="text-center mb-12 animate-fadeInUp">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 p-1 animate-glow">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-4xl font-bold">
                {cardData.profileImage ? (
                  <img
                    src={cardData.profileImage}
                    alt={cardData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  cardData.name.charAt(0)
                )}
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            {cardData.name}
          </h1>
          <p className="text-gray-400 text-lg mb-1">{cardData.title}</p>
          {cardData.company && (
            <p className="text-gray-500">{cardData.company}</p>
          )}
        </div>

        {/* Introduction */}
        {cardData.introduction && (
          <div className="mb-8 animate-fadeInUp animation-delay-200">
            <h2 className="text-xl font-bold mb-4 text-gray-400">소개</h2>
            <div className="p-6 bg-gray-900 bg-opacity-50 backdrop-blur-lg rounded-2xl border border-gray-800">
              <p className="text-gray-300 leading-relaxed">{cardData.introduction}</p>
            </div>
          </div>
        )}

        {/* Contact Grid */}
        <div className="mb-8 animate-fadeInUp animation-delay-400">
          <h2 className="text-xl font-bold mb-4 text-gray-400">연락처</h2>
          <div className="grid grid-cols-1 gap-4">
            <a
              href={`tel:${cardData.phone}`}
              className="flex items-center justify-between p-4 bg-gray-900 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-800 hover:border-green-400 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <span className="text-gray-300">{cardData.phone}</span>
              </div>
              <span className="text-gray-600 group-hover:text-green-400 transition-colors">→</span>
            </a>

            <a
              href={`mailto:${cardData.email}`}
              className="flex items-center justify-between p-4 bg-gray-900 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-800 hover:border-cyan-400 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✉️</span>
                <span className="text-gray-300">{cardData.email}</span>
              </div>
              <span className="text-gray-600 group-hover:text-cyan-400 transition-colors">→</span>
            </a>

            {cardData.website && (
              <a
                href={cardData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-900 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-800 hover:border-purple-400 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <span className="text-gray-300">{cardData.website?.replace(/^https?:\/\//, '')}</span>
                </div>
                <span className="text-gray-600 group-hover:text-purple-400 transition-colors">→</span>
              </a>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8 animate-fadeInUp animation-delay-600">
          <button
            onClick={() => window.location.href = `tel:${cardData.phone}`}
            className="py-3 px-6 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
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
            className="py-3 px-6 bg-gray-800 rounded-xl font-medium hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 border border-gray-700"
          >
            연락처 저장
          </button>
        </div>

        {/* Address & Map */}
        {cardData.address && (
          <div className="mb-8 animate-fadeInUp animation-delay-600">
            <h2 className="text-xl font-bold mb-4 text-gray-400">주소</h2>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg">
              <p className="text-gray-900 font-medium mb-3">📍 {cardData.address}</p>

              {cardData.latitude && cardData.longitude && (
                <MapPreview
                  latitude={cardData.latitude}
                  longitude={cardData.longitude}
                  address={cardData.address}
                  height="250px"
                  level={4}
                />
              )}
            </div>
          </div>
        )}

        {/* Services */}
        {cardData.services && cardData.services.length > 0 && (
          <div className="mb-8 animate-fadeInUp animation-delay-800">
            <h2 className="text-xl font-bold mb-4 text-gray-400">제공 서비스</h2>
            <div className="flex flex-wrap gap-2">
              {cardData.services.map((service, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-green-900 to-cyan-900 bg-opacity-50 rounded-full text-sm text-gray-300 border border-gray-700"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attachments (소개자료) */}
        {cardData.attachments && cardData.attachments.length > 0 && (
          <div className="mb-8 space-y-3 animate-fadeInUp animation-delay-1000">
            <h2 className="text-xl font-bold mb-4 text-gray-400">소개자료 ({cardData.attachments.length})</h2>
            {cardData.attachments.map((attachment) => {
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
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="text-lg">{icon}</span>
                      <p className="text-sm font-medium">{attachment.title}</p>
                    </div>

                    {/* YouTube 카드 */}
                    <div
                      className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-700 bg-gray-900 group cursor-pointer"
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
                              // maxresdefault가 없으면 hqdefault로 fallback
                              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                            }}
                          />

                          {/* 재생 오버레이 */}
                          <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>

                          {/* 재생 시간 표시 (선택사항) */}
                          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black bg-opacity-80 rounded text-xs text-white">
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
                  className="flex items-center justify-between p-4 bg-gray-800 bg-opacity-70 rounded-xl border border-gray-700 hover:border-green-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 font-medium text-sm truncate">{attachment.title}</p>
                      {!isYouTube && attachment.filename && attachment.file_size && (
                        <p className="text-gray-500 text-xs mt-0.5 truncate">
                          {attachment.filename} • {(attachment.file_size / 1024).toFixed(1)}KB
                        </p>
                      )}
                      {isYouTube && (
                        <p className="text-gray-500 text-xs mt-0.5">YouTube 영상</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => setPreviewAttachment(attachment)}
                      className="px-4 py-2 bg-gray-700 rounded-lg font-medium text-sm hover:bg-gray-600 transition-all duration-300 whitespace-nowrap flex-shrink-0"
                    >
                      미리보기
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 py-6 border-t border-gray-800">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <img src="/assets/GP 로고.png" alt="G-PLAT" className="w-6 h-6" />
            <span className="text-sm">Powered by G-PLAT</span>
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
            className="relative max-w-4xl w-full max-h-[90vh] bg-gray-900 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white truncate flex-1">
                {previewAttachment.title}
              </h3>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="ml-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 9rem)' }}>
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
                <div className="w-full" style={{ height: 'calc(90vh - 14rem)' }}>
                  <iframe
                    src={previewAttachment.file_url}
                    className="w-full h-full rounded-lg"
                    title={previewAttachment.title}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer with Download Button */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-800 bg-gray-900">
              <button
                onClick={() => setPreviewAttachment(null)}
                className="px-4 py-2 text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
              >
                닫기
              </button>
              {previewAttachment.attachment_type !== 'youtube' && previewAttachment.file_url && (
                <a
                  href={previewAttachment.file_url}
                  download={previewAttachment.file_type === 'application/pdf' ? undefined : previewAttachment.filename}
                  onClick={(e) => {
                    if (businessCardId) {
                      trackDownload({
                        attachmentId: previewAttachment.id,
                        businessCardId: businessCardId
                      })
                    }
                    if (previewAttachment.file_type === 'application/pdf') {
                      e.preventDefault()
                      window.open(previewAttachment.file_url, '_blank')
                    }
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {previewAttachment.file_type === 'application/pdf' ? 'PDF 열기' : '다운로드'}
                </a>
              )}
              {previewAttachment.attachment_type === 'youtube' && previewAttachment.youtube_url && (
                <a
                  href={previewAttachment.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube에서 보기
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes gradient-xy {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(-10%) translateY(10%); }
          50% { transform: translateX(10%) translateY(-10%); }
          75% { transform: translateX(-10%) translateY(-10%); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
        }

        .animate-gradient-xy {
          animation: gradient-xy 20s ease infinite;
          background-size: 200% 200%;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
      `}</style>
    </div>
  )
}