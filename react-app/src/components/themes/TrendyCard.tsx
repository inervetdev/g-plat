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
}

export function TrendyCard({ userId }: { userId: string }) {
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
          profileImage: businessCard.profile_image || ''
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
            name: userData.name || '김대리',
            title: profileData?.title || 'Full Stack Developer',
            company: profileData?.company || 'G-PLAT Tech',
            phone: userData.phone || '010-1234-5678',
            email: userData.email || 'demo@gplat.com',
            website: profileData?.website || 'https://gplat.com',
            introduction: profileData?.introduction || '안녕하세요! 풀스택 개발자입니다. React, Node.js, TypeScript를 주로 사용하며, 모바일 명함 서비스를 개발하고 있습니다.',
            services: profileData?.services || ['웹 개발', '앱 개발', 'UI/UX 디자인', '기술 컨설팅'],
            profileImage: profileData?.profile_image || ''
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
          <div className="mb-8 p-6 bg-gray-900 bg-opacity-50 backdrop-blur-lg rounded-2xl border border-gray-800 animate-fadeInUp animation-delay-200">
            <p className="text-gray-300 leading-relaxed">{cardData.introduction}</p>
          </div>
        )}

        {/* Contact Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8 animate-fadeInUp animation-delay-400">
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
                <span className="text-gray-300">{cardData.website.replace(/^https?:\/\//, '')}</span>
              </div>
              <span className="text-gray-600 group-hover:text-purple-400 transition-colors">→</span>
            </a>
          )}
        </div>

        {/* Services */}
        {cardData.services && cardData.services.length > 0 && (
          <div className="mb-8 animate-fadeInUp animation-delay-600">
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

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 animate-fadeInUp animation-delay-800">
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

        {/* Footer */}
        <div className="text-center mt-12 py-6 border-t border-gray-800">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <img src="/assets/GP 로고.png" alt="G-PLAT" className="w-6 h-6" />
            <span className="text-sm">Powered by G-PLAT</span>
          </div>
        </div>
      </div>

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