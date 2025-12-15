import { useState } from 'react'
import { X, AlertTriangle, Loader2, CheckCircle } from 'lucide-react'
import { submitReport, checkDuplicateReport } from '@/lib/api/reports'
import type { ReportData } from '@/lib/api/reports'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetType: 'business_card' | 'sidejob_card' | 'user'
  targetId: string
  targetOwnerId?: string
  targetName?: string
}

const REPORT_TYPES = [
  { value: 'spam', label: '스팸/광고', description: '광고성 또는 반복적인 콘텐츠' },
  { value: 'inappropriate', label: '부적절한 콘텐츠', description: '선정적, 폭력적 또는 혐오 표현' },
  { value: 'fraud', label: '사기/허위 정보', description: '거짓 정보 또는 사기 시도' },
  { value: 'copyright', label: '저작권 침해', description: '무단 이미지/로고 사용' },
  { value: 'privacy', label: '개인정보 노출', description: '타인의 정보 무단 게시' },
  { value: 'other', label: '기타', description: '위에 해당하지 않는 경우' },
] as const

type ReportType = typeof REPORT_TYPES[number]['value']

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetOwnerId,
  targetName,
}: ReportModalProps) {
  const [reportType, setReportType] = useState<ReportType | ''>('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [notifyReporter, setNotifyReporter] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!reportType) {
      setError('신고 사유를 선택해주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 중복 신고 확인
      const isDuplicate = await checkDuplicateReport(targetType, targetId)
      if (isDuplicate) {
        setError('이미 동일한 콘텐츠에 대한 신고가 접수되어 있습니다.')
        setIsSubmitting(false)
        return
      }

      const data: ReportData = {
        target_type: targetType,
        target_id: targetId,
        target_owner_id: targetOwnerId,
        report_type: reportType,
        description: description.trim() || undefined,
        reporter_email: email.trim() || undefined,
        notify_reporter: notifyReporter,
      }

      await submitReport(data)
      setIsSuccess(true)

      // 3초 후 자동 닫기
      setTimeout(() => {
        handleClose()
      }, 3000)
    } catch (err) {
      console.error('Report submission error:', err)
      setError('신고 접수 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReportType('')
    setDescription('')
    setEmail('')
    setNotifyReporter(true)
    setIsSuccess(false)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  const targetTypeLabel = {
    business_card: '명함',
    sidejob_card: '부가명함',
    user: '사용자',
  }[targetType]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">콘텐츠 신고하기</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {isSuccess ? (
          // 성공 화면
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">신고가 접수되었습니다</h3>
            <p className="text-gray-600 mb-4">
              신고 내용을 검토 후 적절한 조치를 취하겠습니다.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        ) : (
          // 신고 폼
          <div className="p-6">
            {/* 대상 정보 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">신고 대상</p>
              <p className="font-medium text-gray-900">
                {targetName || targetTypeLabel}
              </p>
            </div>

            {/* 신고 사유 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                신고 사유 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {REPORT_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      reportType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.value}
                      checked={reportType === type.value}
                      onChange={(e) => setReportType(e.target.value as ReportType)}
                      className="mt-0.5 mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{type.label}</p>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 상세 설명 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 설명 (선택)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="신고 사유에 대해 자세히 설명해주세요."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {description.length}/500
              </p>
            </div>

            {/* 이메일 알림 */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyReporter}
                  onChange={(e) => setNotifyReporter(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">처리 결과를 이메일로 받겠습니다</span>
              </label>

              {notifyReporter && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소 (선택)"
                  className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !reportType}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    접수 중...
                  </>
                ) : (
                  '신고하기'
                )}
              </button>
            </div>

            {/* 안내 문구 */}
            <p className="mt-4 text-xs text-gray-400 text-center">
              허위 신고는 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
