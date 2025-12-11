import { useState } from 'react'
import { X, Search, Loader2, MapPin, Building, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AddressResult {
  roadAddress: string
  jibunAddress: string
  englishAddress: string
  x: string // longitude (경도)
  y: string // latitude (위도)
  addressName?: string
  buildingName?: string
  zoneNo?: string // 우편번호
}

interface AddressSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (address: string, latitude?: number, longitude?: number) => void
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
      // Supabase Edge Function을 통해 카카오 Geocoding API 호출
      const { data, error: functionError } = await supabase.functions.invoke('kakao-geocode', {
        body: { query: searchQuery }
      })

      if (functionError) {
        console.error('Edge Function error:', functionError)
        throw new Error(functionError.message || '주소 검색에 실패했습니다')
      }

      // 카카오 Geocoding API 응답 구조: { addresses: [...] }
      const addresses = data?.addresses || []

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
    const latitude = parseFloat(address.y)
    const longitude = parseFloat(address.x)
    onSelect(selectedAddress, latitude, longitude)
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchAddress()
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setResults([])
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">주소 검색</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="도로명, 지번, 건물명 등을 입력하세요"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            <button
              onClick={searchAddress}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  검색중
                </>
              ) : (
                '검색'
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            예: 강남구 테헤란로 123, 서울시 강남구 역삼동 123-45, 이너벳
          </p>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
          {error && (
            <div className="p-8 text-center">
              <div className="text-red-500 text-sm">{error}</div>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-4 space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(result)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all group"
                >
                  <div className="font-medium text-gray-900 group-hover:text-blue-700">
                    {result.roadAddress || result.jibunAddress}
                  </div>
                  {result.roadAddress && result.jibunAddress && result.roadAddress !== result.jibunAddress && (
                    <div className="text-sm text-gray-500 mt-1">
                      (지번) {result.jibunAddress}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    {result.buildingName && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Building className="w-3 h-3" />
                        {result.buildingName}
                      </div>
                    )}
                    {result.zoneNo && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />
                        {result.zoneNo}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>주소를 검색해주세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
