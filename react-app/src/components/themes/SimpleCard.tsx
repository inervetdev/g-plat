import { useEffect, useState } from 'react'
import { loadBusinessCardData, defaultDemoData, type CardData } from '../../lib/cardDataLoader'

export function SimpleCard({ userId }: { userId: string }) {
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
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">{cardData.name}</h1>
            <p className="text-gray-500">{cardData.title}</p>
            {cardData.company && (
              <p className="text-sm text-gray-400 mt-1">{cardData.company}</p>
            )}
          </div>

          {/* Divider */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 mx-auto mb-6"></div>

          {/* Contact Info */}
          <div className="space-y-3">
            <a
              href={`tel:${cardData.phone}`}
              className="flex items-center gap-3 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <span className="text-lg">📞</span>
              <span className="text-sm">{cardData.phone}</span>
            </a>

            <a
              href={`mailto:${cardData.email}`}
              className="flex items-center gap-3 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <span className="text-lg">✉️</span>
              <span className="text-sm">{cardData.email}</span>
            </a>

            {cardData.website && (
              <a
                href={cardData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <span className="text-lg">🌐</span>
                <span className="text-sm">{cardData.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </div>

        {/* Introduction */}
        {cardData.introduction && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">소개</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{cardData.introduction}</p>

            {/* Attachment Download Button */}
            {cardData.attachment_url && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">📎</span>
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium text-sm">{cardData.attachment_title || '첨부파일'}</p>
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
                  className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-all transform hover:scale-105 whitespace-nowrap"
                >
                  다운로드
                </a>
              </div>
            )}
          </div>
        )}

        {/* Services */}
        {cardData.services && cardData.services.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">서비스</h2>
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

        {/* Action Buttons */}
        <div className="flex gap-3">
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

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <img src="/assets/GP 로고.png" alt="G-PLAT" className="w-4 h-4 opacity-50" />
            <span className="text-xs">Powered by G-PLAT</span>
          </div>
        </div>
      </div>

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