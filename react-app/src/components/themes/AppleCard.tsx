import { useEffect, useState } from 'react'
import { loadBusinessCardData, defaultDemoData, type CardData } from '../../lib/cardDataLoader'

export function AppleCard({ userId }: { userId: string }) {
  const [cardData, setCardData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCardData()
  }, [userId])

  const loadCardData = async () => {
    try {
      const data = await loadBusinessCardData(userId)
      setCardData(data || defaultDemoData)
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

        {/* Action Buttons */}
        <div className="bg-white px-4 pb-4">
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

        {/* Services */}
        {cardData.services && cardData.services.length > 0 && (
          <div className="mt-2 bg-white">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium">서비스</h3>
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
    </div>
  )
}