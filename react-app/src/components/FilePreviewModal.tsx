import { useEffect, useState } from 'react'

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  fileName: string
  fileType: string
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileType
}: FilePreviewModalProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      // Reset loading state when modal opens
      const timer = setTimeout(() => setLoading(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen, fileUrl])

  if (!isOpen) return null

  const isImage = fileType.startsWith('image/')
  const isVideo = fileType.startsWith('video/') && fileType !== 'video/youtube'
  const isYouTube = fileType === 'video/youtube'
  const isPDF = fileType === 'application/pdf'
  const isDocument = fileType.includes('word') || fileType.includes('document') ||
                     fileType.includes('presentation') || fileType.includes('spreadsheet')

  // Extract YouTube video ID
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      let videoId = ''

      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v') || ''
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1)
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    } catch {
      return url
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{fileName}</h3>
            <p className="text-sm text-gray-500">{fileType}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Image Preview */}
          {isImage && (
            <div className="flex items-center justify-center">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full h-auto rounded-lg"
                onLoad={() => setLoading(false)}
              />
            </div>
          )}

          {/* Video Preview */}
          {isVideo && (
            <div className="flex items-center justify-center">
              <video
                src={fileUrl}
                controls
                className="max-w-full h-auto rounded-lg"
                onLoadedData={() => setLoading(false)}
              >
                <track kind="captions" />
                브라우저가 비디오를 지원하지 않습니다.
              </video>
            </div>
          )}

          {/* YouTube Preview */}
          {isYouTube && (
            <div className="w-full" style={{ height: 'calc(90vh - 12rem)' }}>
              <iframe
                src={getYouTubeEmbedUrl(fileUrl)}
                className="w-full h-full border-0 rounded-lg"
                title={fileName}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setLoading(false)}
              />
            </div>
          )}

          {/* PDF Preview */}
          {isPDF && (
            <div className="w-full" style={{ height: 'calc(90vh - 12rem)' }}>
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-0 rounded-lg"
                title={fileName}
                onLoad={() => setLoading(false)}
              />
            </div>
          )}

          {/* Document Preview (not directly previewable) */}
          {isDocument && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 mb-4">이 문서는 미리보기를 지원하지 않습니다.</p>
              <a
                href={fileUrl}
                download={fileName}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                다운로드
              </a>
            </div>
          )}

          {/* Unknown file type */}
          {!isImage && !isVideo && !isPDF && !isDocument && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 mb-4">미리보기를 사용할 수 없는 파일 형식입니다.</p>
              <a
                href={fileUrl}
                download={fileName}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                다운로드
              </a>
            </div>
          )}
        </div>

        {/* Footer with download button */}
        {(isImage || isVideo || isPDF || isYouTube) && !loading && (
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              닫기
            </button>
            {!isYouTube && (
              <a
                href={fileUrl}
                download={fileName}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                다운로드
              </a>
            )}
            {isYouTube && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube에서 보기
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
