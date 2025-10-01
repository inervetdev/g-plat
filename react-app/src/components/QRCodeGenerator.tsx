import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase'
import { Download, Link, BarChart3, Settings, Copy, Check } from 'lucide-react'

interface QRCodeGeneratorProps {
  url: string
  title?: string
  businessCardId?: string
  campaign?: string
  enableTracking?: boolean
}

export default function QRCodeGenerator({
  url,
  title = '명함 QR 코드',
  businessCardId,
  campaign,
  enableTracking = true
}: QRCodeGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [shortUrl, setShortUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [qrOptions, setQrOptions] = useState({
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })

  // Generate unique short code
  const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  // Create or get QR code record
  const createQRRecord = async () => {
    if (!enableTracking) return url

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return url

      // First, check if a QR code already exists for this business card and campaign
      if (businessCardId) {
        const { data: existingQR, error: fetchError } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('business_card_id', businessCardId)
          .eq('campaign', campaign || 'business_card')
          .eq('user_id', user.id)
          .single()

        if (existingQR && !fetchError) {
          // Use existing QR code with Edge Function URL
          const isDevelopment = window.location.hostname === 'localhost'
          const trackingUrl = isDevelopment
            ? url // Development: use direct URL
            : `https://anwwjowwrxdygqyhhckr.supabase.co/functions/v1/qr-redirect/${existingQR.short_code}`
          setShortUrl(trackingUrl)
          console.log('Using existing QR code:', existingQR.short_code)
          return trackingUrl
        }
      }

      // Generate new QR code if none exists
      const shortCode = generateShortCode()

      // Use Edge Function URL for production, direct URL for development
      const isDevelopment = window.location.hostname === 'localhost'
      const trackingUrl = isDevelopment
        ? url // Development: use direct URL
        : `https://anwwjowwrxdygqyhhckr.supabase.co/functions/v1/qr-redirect/${shortCode}`

      const { data, error } = await supabase
        .from('qr_codes')
        .insert({
          user_id: user.id,
          business_card_id: businessCardId,
          short_code: shortCode,
          target_url: url,
          target_type: 'static',
          campaign: campaign || 'business_card',
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating QR record:', error)
        // If unique constraint error, try to fetch the existing record
        if (error.code === '23505') {
          const { data: existingQR } = await supabase
            .from('qr_codes')
            .select('*')
            .eq('business_card_id', businessCardId)
            .eq('campaign', campaign || 'business_card')
            .eq('user_id', user.id)
            .single()

          if (existingQR) {
            const isDevelopment = window.location.hostname === 'localhost'
            const trackingUrl = isDevelopment
              ? url // Development: use direct URL
              : `https://anwwjowwrxdygqyhhckr.supabase.co/functions/v1/qr-redirect/${existingQR.short_code}`
            setShortUrl(trackingUrl)
            return trackingUrl
          }
        }
        return url
      }

      console.log('Created new QR code:', shortCode)
      setShortUrl(trackingUrl)
      return trackingUrl
    } catch (error) {
      console.error('Error:', error)
      return url
    }
  }

  // Generate QR code
  const generateQR = async () => {
    setLoading(true)
    try {
      const targetUrl = enableTracking ? await createQRRecord() : url

      const qrString = await QRCode.toDataURL(targetUrl, {
        width: qrOptions.width,
        margin: qrOptions.margin,
        color: qrOptions.color,
        errorCorrectionLevel: 'M'
      })

      setQrDataUrl(qrString)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateQR()
  }, [url, qrOptions, businessCardId, campaign])

  // Download QR code as image
  const downloadQR = () => {
    const link = document.createElement('a')
    link.download = `qr-code-${Date.now()}.png`
    link.href = qrDataUrl
    link.click()
  }

  // Copy short URL to clipboard
  const copyShortUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl || url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* QR Settings */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              크기
            </label>
            <select
              value={qrOptions.width}
              onChange={(e) => setQrOptions({ ...qrOptions, width: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value={128}>작게 (128px)</option>
              <option value={256}>보통 (256px)</option>
              <option value={512}>크게 (512px)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전경색
            </label>
            <input
              type="color"
              value={qrOptions.color.dark}
              onChange={(e) => setQrOptions({
                ...qrOptions,
                color: { ...qrOptions.color, dark: e.target.value }
              })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              배경색
            </label>
            <input
              type="color"
              value={qrOptions.color.light}
              onChange={(e) => setQrOptions({
                ...qrOptions,
                color: { ...qrOptions.color, light: e.target.value }
              })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* QR Code Display */}
      <div className="flex flex-col items-center">
        {loading ? (
          <div className="w-64 h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <span className="text-gray-500">QR 코드 생성 중...</span>
          </div>
        ) : qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR Code"
            className="border-2 border-gray-200 rounded-lg"
            style={{ width: qrOptions.width, height: qrOptions.width }}
          />
        ) : null}

        {/* Short URL Display */}
        {shortUrl && enableTracking && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg w-full max-w-sm">
            <p className="text-xs text-blue-600 mb-1">단축 URL (추적 가능)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-white px-2 py-1 rounded border border-blue-200">
                {shortUrl}
              </code>
              <button
                onClick={copyShortUrl}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-blue-600" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={downloadQR}
            disabled={!qrDataUrl}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            다운로드
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(qrDataUrl)}
            disabled={!qrDataUrl}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Link className="w-4 h-4" />
            공유
          </button>

          {enableTracking && (
            <button
              onClick={() => window.open(`/qr-stats/${shortUrl?.split('/').pop()}`, '_blank')}
              disabled={!shortUrl}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BarChart3 className="w-4 h-4" />
              통계
            </button>
          )}
        </div>
      </div>

      {/* Features Info */}
      {enableTracking && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">QR 코드 기능</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 스캔 횟수 및 방문자 추적</li>
            <li>• 지역별, 디바이스별 통계</li>
            <li>• 동적 URL 변경 가능</li>
            <li>• 캠페인 성과 측정</li>
          </ul>
        </div>
      )}
    </div>
  )
}