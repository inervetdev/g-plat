import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface CardData {
  name: string
  title: string
  company: string
  phone: string
  email: string
  website?: string
  introduction?: string
  services?: string[]
  profileImage?: string
  attachment_title?: string
  attachment_url?: string
  attachment_filename?: string
}

export function ProfessionalCard({ userId }: { userId: string }) {
  const [cardData, setCardData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)

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
        setCardData({
          name: businessCard.name,
          title: businessCard.title || '',
          company: businessCard.company || '',
          phone: businessCard.phone || '',
          email: businessCard.email || '',
          website: businessCard.website || '',
          introduction: businessCard.introduction || '',
          services: businessCard.services || [],
          profileImage: businessCard.profile_image || '',
          attachment_title: businessCard.attachment_title || '',
          attachment_url: businessCard.attachment_url || '',
          attachment_filename: businessCard.attachment_filename || ''
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
          setCardData({
            name: userData.name || '',
            title: profileData?.title || '프리랜서',
            company: profileData?.company || '',
            phone: userData.phone || '',
            email: userData.email || '',
            website: profileData?.website || '',
            introduction: profileData?.introduction || '',
            services: profileData?.services || [],
            profileImage: profileData?.profile_image || ''
          })
        } else {
          // Fallback demo data when no user data is available
          setCardData({
            name: '이대섭',
            title: 'Full Stack Developer',
            company: 'Inervet',
            phone: '010-1234-5678',
            email: 'dslee@inervet.com',
            website: 'https://inervet.com',
            introduction: '안녕하세요! 풀스택 개발자입니다.',
            services: ['웹 개발', '앱 개발', 'UI/UX 디자인']
          })
        }
      }
    } catch (error) {
      console.error('Error loading card data:', error)
      // Fallback demo data on error
      setCardData({
        name: '이대섭',
        title: 'Full Stack Developer',
        company: 'Inervet',
        phone: '010-1234-5678',
        email: 'dslee@inervet.com',
        website: 'https://inervet.com',
        introduction: '안녕하세요! 풀스택 개발자입니다.',
        services: ['웹 개발', '앱 개발', 'UI/UX 디자인']
      })
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
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      style={{ fontFamily: '"Apple SD Gothic Neo", -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      <div className="max-w-md mx-auto">
        {/* Header with Navy Background */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2c4a6f] text-white px-6 py-8">
          {/* Company Badge */}
          {cardData.company && (
            <div className="inline-flex items-center gap-2 bg-[#c9a961] text-[#1e3a5f] px-4 py-1 rounded-full text-sm font-medium mb-6">
              <span>✓</span>
              <span>{cardData.company}</span>
            </div>
          )}

          {/* Profile */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center">
              {cardData.profileImage ? (
                <img
                  src={cardData.profileImage}
                  alt={cardData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-[#1e3a5f]">
                  {cardData.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{cardData.name}</h1>
              <p className="text-[#c9a961] font-medium">{cardData.title}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6">
        {/* Introduction Card */}
        {cardData.introduction && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-[#c9a961]">
            <h2 className="text-[#1e3a5f] font-bold mb-3">소개</h2>
            <p className="text-gray-600 leading-relaxed">{cardData.introduction}</p>

            {/* Attachment Download Button */}
            {cardData.attachment_url && (
              <div className="mt-4 flex items-center justify-between p-3 bg-[#faf8f4] rounded-lg border border-[#c9a961]">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">📎</span>
                  <div className="flex-1">
                    <p className="text-[#1e3a5f] font-medium text-sm">{cardData.attachment_title || '첨부파일'}</p>
                    {cardData.attachment_filename && (
                      <p className="text-gray-500 text-xs mt-0.5">{cardData.attachment_filename}</p>
                    )}
                  </div>
                </div>
                <a
                  href={cardData.attachment_url}
                  download={cardData.attachment_filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg font-medium text-sm hover:bg-[#2c4a6f] transition-all whitespace-nowrap"
                >
                  다운로드
                </a>
              </div>
            )}
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-[#1e3a5f] font-bold mb-4">연락처 정보</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white">
                📞
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">전화번호</p>
                <a href={`tel:${cardData.phone}`} className="text-[#1e3a5f] font-medium hover:text-[#c9a961] transition-colors">
                  {cardData.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white">
                ✉️
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">이메일</p>
                <a href={`mailto:${cardData.email}`} className="text-[#1e3a5f] font-medium hover:text-[#c9a961] transition-colors">
                  {cardData.email}
                </a>
              </div>
            </div>

            {cardData.website && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-white">
                  🌐
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">웹사이트</p>
                  <a
                    href={cardData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1e3a5f] font-medium hover:text-[#c9a961] transition-colors"
                  >
                    {cardData.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        {cardData.services && cardData.services.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-[#1e3a5f] font-bold mb-4">전문 서비스</h2>
            <div className="grid grid-cols-2 gap-3">
              {cardData.services.map((service, index) => (
                <div
                  key={index}
                  className="border border-[#e5e7eb] rounded-lg px-4 py-3 text-center hover:border-[#c9a961] hover:bg-[#faf8f4] transition-all"
                >
                  <span className="text-sm text-gray-700">{service}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => window.location.href = `tel:${cardData.phone}`}
            className="bg-[#1e3a5f] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#2c4a6f] transition-colors shadow-sm"
          >
            <span className="block text-2xl mb-1">📞</span>
            <span>전화 연결</span>
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
            className="bg-[#c9a961] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#b89751] transition-colors shadow-sm"
          >
            <span className="block text-2xl mb-1">💼</span>
            <span>명함 저장</span>
          </button>
        </div>

        {/* Professional Badge */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2c4a6f] rounded-lg p-4 text-white text-center">
          <p className="text-sm opacity-90">인증된 비즈니스 프로필</p>
          <p className="text-xs opacity-70 mt-1">Professional Business Card</p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-6">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <img src="/assets/GP 로고.png" alt="G-PLAT" className="w-5 h-5 opacity-50" />
            <span className="text-xs">Powered by G-PLAT Business</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}