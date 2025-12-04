import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * QR 코드 리다이렉트 페이지
 * /q/:code 경로로 접속하면 Edge Function으로 리다이렉트합니다.
 * Edge Function에서 스캔 추적 및 target_url로 리다이렉트를 처리합니다.
 */
export default function QRRedirectPage() {
  const { code } = useParams<{ code: string }>()

  useEffect(() => {
    if (code) {
      // Edge Function URL로 리다이렉트
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/qr-redirect/${code}`
      window.location.href = edgeFunctionUrl
    }
  }, [code])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-600 text-sm font-medium">
          리다이렉트 중...
        </p>
      </div>
    </div>
  )
}
