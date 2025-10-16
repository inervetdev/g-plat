import { useState } from 'react'

// Naver Maps API 타입 선언
declare global {
  interface Window {
    naver: any
  }
}

interface AddressResult {
  roadAddress: string
  jibunAddress: string
  englishAddress: string
  x: string // longitude
  y: string // latitude
}

interface AddressSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (address: string) => void
}

export function AddressSearchModal({ isOpen, onClose, onSelect }: AddressSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<AddressResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchAddress = async () => {
    if (!searchQuery.trim()) {
      setError('검색어를 입력해주세요')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      // 네이버 지도 JavaScript API 사용 (클라이언트 사이드)
      if (!window.naver || !window.naver.maps || !window.naver.maps.Service) {
        throw new Error('네이버 지도 API를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      }

      // Promise로 래핑
      const geocodeResult = await new Promise<any>((resolve, reject) => {
        window.naver.maps.Service.geocode(
          {
            query: searchQuery,
          },
          (status: any, response: any) => {
            if (status === window.naver.maps.Service.Status.OK) {
              resolve(response)
            } else if (status === window.naver.maps.Service.Status.ZERO_RESULT) {
              resolve({ v2: { addresses: [] } })
            } else {
              reject(new Error('주소 검색에 실패했습니다'))
            }
          }
        )
      })

      const addresses = geocodeResult.v2?.addresses || []

      if (addresses && addresses.length > 0) {
        setResults(addresses)
      } else {
        setError('검색 결과가 없습니다. 다른 키워드로 시도해보세요.')
      }
    } catch (err) {
      console.error('Address search error:', err)
      const errorMessage = err instanceof Error ? err.message : '주소 검색 중 오류가 발생했습니다'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (address: AddressResult) => {
    // 도로명 주소 우선, 없으면 지번 주소 사용
    const selectedAddress = address.roadAddress || address.jibunAddress
    onSelect(selectedAddress)
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchAddress()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">주소 검색</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="도로명, 지번, 건물명 등을 입력하세요"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={searchAddress}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '검색중...' : '검색'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            예: 강남구 테헤란로 123, 서울시 강남구 역삼동 123-45
          </p>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 240px)' }}>
          {error && (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(result)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                >
                  <div className="font-medium text-gray-900">
                    {result.roadAddress || result.jibunAddress}
                  </div>
                  {result.roadAddress && result.jibunAddress && (
                    <div className="text-sm text-gray-500 mt-1">
                      (지번) {result.jibunAddress}
                    </div>
                  )}
                  {result.englishAddress && (
                    <div className="text-xs text-gray-400 mt-1">
                      {result.englishAddress}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              주소를 검색해주세요
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
