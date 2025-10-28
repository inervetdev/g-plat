import { QrCode, ExternalLink, Eye, Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface UserQRTabProps {
  userId: string
}

export function UserQRTab({ userId }: UserQRTabProps) {
  const { data: qrCodes, isLoading, error } = useQuery({
    queryKey: ['userQRCodes', userId],
    queryFn: async () => {
      // First get user's business cards
      const { data: cards, error: cardsError } = await supabase
        .from('business_cards')
        .select('id')
        .eq('user_id', userId)

      if (cardsError) throw cardsError
      if (!cards || cards.length === 0) return []

      const cardIds = cards.map((c) => c.id)

      // Then get QR codes for those cards
      const { data: qrs, error: qrError } = await supabase
        .from('qr_codes')
        .select(`
          *,
          business_cards (
            id,
            name,
            company,
            custom_url
          )
        `)
        .in('card_id', cardIds)
        .order('created_at', { ascending: false })

      if (qrError) throw qrError

      // Get scan counts
      const qrCodesWithScans = await Promise.all(
        (qrs || []).map(async (qr: any) => {
          const { count } = await supabase
            .from('qr_scans')
            .select('*', { count: 'exact', head: true })
            .eq('qr_code_id', qr.id)

          return {
            ...qr,
            scan_count: count || 0,
          }
        })
      )

      return qrCodesWithScans
    },
    enabled: !!userId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-8 border border-gray-100">
        <p className="text-red-600 text-center">QR 코드 목록을 불러오는 중 오류가 발생했습니다</p>
        <p className="text-gray-500 text-sm text-center mt-2">{(error as Error).message}</p>
      </div>
    )
  }

  if (!qrCodes || qrCodes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 border border-gray-100 text-center">
        <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">생성된 QR 코드가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                QR 코드
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                연결된 명함
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Short Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                스캔 수
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {qrCodes.map((qr: any) => (
              <tr key={qr.id} className="hover:bg-gray-50 transition">
                {/* QR Code Image */}
                <td className="px-6 py-4">
                  <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-lg p-2">
                    <QrCode className="w-full h-full text-gray-700" />
                  </div>
                </td>

                {/* Business Card */}
                <td className="px-6 py-4">
                  {qr.business_cards ? (
                    <div>
                      <p className="font-medium text-gray-900">{qr.business_cards.name}</p>
                      <p className="text-sm text-gray-500">{qr.business_cards.company}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">명함 정보 없음</p>
                  )}
                </td>

                {/* Short Code */}
                <td className="px-6 py-4">
                  <code className="px-2 py-1 bg-gray-100 text-gray-900 text-sm rounded font-mono">
                    {qr.short_code}
                  </code>
                </td>

                {/* Scan Count */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{qr.scan_count}</span>
                  </div>
                </td>

                {/* Created At */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(qr.created_at).toLocaleDateString('ko-KR')}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://g-plat.com/q/${qr.short_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="QR 링크 열기"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="QR 코드 다운로드"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          총 {qrCodes.length}개의 QR 코드 ·{' '}
          총 스캔 수:{' '}
          <span className="font-semibold text-gray-900">
            {qrCodes.reduce((sum: number, qr: any) => sum + qr.scan_count, 0).toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  )
}
