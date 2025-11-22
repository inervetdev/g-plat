import { useEffect, useRef } from 'react'

interface MapPreviewProps {
  latitude: number
  longitude: number
  address: string
  height?: string
  level?: number // 지도 확대 레벨 (1-14, 작을수록 확대)
}

declare global {
  interface Window {
    kakao: any
  }
}

export function MapPreview({
  latitude,
  longitude,
  address,
  height = '400px',
  level = 3
}: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // 카카오 맵 SDK가 로드될 때까지 대기
    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        console.warn('Kakao Maps SDK not loaded yet')
        return
      }

      // 지도 생성
      const mapOption = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: level
      }

      const map = new window.kakao.maps.Map(mapRef.current, mapOption)
      mapInstanceRef.current = map

      // 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(latitude, longitude)
      const marker = new window.kakao.maps.Marker({
        position: markerPosition
      })
      marker.setMap(map)
      markerRef.current = marker

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:10px;min-width:150px;text-align:center;">
          <strong style="display:block;font-size:14px;">${address}</strong>
        </div>`,
        removable: false
      })
      infowindow.open(map, marker)
    }

    // 카카오 맵 SDK 로드 확인
    if (window.kakao && window.kakao.maps) {
      initMap()
    } else {
      // 커스텀 이벤트 리스너 등록
      const handleKakaoMapsLoaded = () => {
        initMap()
      }
      window.addEventListener('kakao-maps-loaded', handleKakaoMapsLoaded)

      // SDK 로드 대기 (fallback)
      const checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkInterval)
          initMap()
        }
      }, 100)

      return () => {
        window.removeEventListener('kakao-maps-loaded', handleKakaoMapsLoaded)
        clearInterval(checkInterval)
      }
    }
  }, [latitude, longitude, address, level])

  // 좌표 변경 시 지도 중심 이동
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && window.kakao) {
      const newPosition = new window.kakao.maps.LatLng(latitude, longitude)
      mapInstanceRef.current.setCenter(newPosition)
      markerRef.current.setPosition(newPosition)
    }
  }, [latitude, longitude])

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ width: '100%', height }}
        className="rounded-lg overflow-hidden border border-gray-200"
      />
      {!window.kakao && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
          style={{ height }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  )
}
