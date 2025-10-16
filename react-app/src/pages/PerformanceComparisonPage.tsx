import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

interface PerformanceMetrics {
  renderTime: number
  reRenderTime: number
  memoryUsed: number
  componentCount: number
}

export default function PerformanceComparisonPage() {
  const [originalMetrics, setOriginalMetrics] = useState<PerformanceMetrics | null>(null)
  const [optimizedMetrics, setOptimizedMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)

  const measurePerformance = async (url: string): Promise<PerformanceMetrics> => {
    const startTime = performance.now()

    // Create a hidden iframe to load the page
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    document.body.appendChild(iframe)

    return new Promise((resolve) => {
      iframe.onload = () => {
        const endTime = performance.now()
        const renderTime = endTime - startTime

        // Measure re-render time (simulate state change)
        const reRenderStart = performance.now()
        // Trigger a re-render by changing URL hash
        iframe.contentWindow?.history.pushState(null, '', '#test')
        const reRenderTime = performance.now() - reRenderStart

        // Get memory usage if available
        const memoryUsed = (performance as any).memory?.usedJSHeapSize || 0

        // Count React components (approximate)
        const componentCount = iframe.contentDocument?.querySelectorAll('[data-reactroot] *').length || 0

        // Clean up
        document.body.removeChild(iframe)

        resolve({
          renderTime,
          reRenderTime,
          memoryUsed,
          componentCount
        })
      }
    })
  }

  const runComparison = async () => {
    setIsLoading(true)
    setOriginalMetrics(null)
    setOptimizedMetrics(null)

    try {
      // Measure original dashboard
      const original = await measurePerformance('/dashboard')
      setOriginalMetrics(original)

      // Measure optimized dashboard
      const optimized = await measurePerformance('/dashboard-optimized')
      setOptimizedMetrics(optimized)
    } catch (error) {
      console.error('Performance measurement failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateImprovement = (original: number, optimized: number): string => {
    const improvement = ((original - optimized) / original) * 100
    return improvement > 0
      ? `${improvement.toFixed(1)}% 개선`
      : `${Math.abs(improvement).toFixed(1)}% 증가`
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            React Compiler 성능 비교
          </h1>
          <p className="text-gray-600">
            수동 최적화 vs React Compiler 자동 최적화 성능 측정
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              to="/dashboard"
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              원본 대시보드 →
            </Link>
            <Link
              to="/dashboard-optimized"
              className="text-green-600 hover:underline"
              target="_blank"
            >
              최적화 대시보드 →
            </Link>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={runComparison}
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98'
            }`}
          >
            {isLoading ? '측정 중...' : '성능 측정 시작'}
          </button>
        </div>

        {/* Results */}
        {(originalMetrics || optimizedMetrics) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Dashboard */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                원본 대시보드 (수동 최적화)
              </h2>
              {originalMetrics ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">초기 렌더링 시간</span>
                    <span className="font-mono font-semibold">
                      {originalMetrics.renderTime.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">리렌더링 시간</span>
                    <span className="font-mono font-semibold">
                      {originalMetrics.reRenderTime.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">메모리 사용량</span>
                    <span className="font-mono font-semibold">
                      {formatBytes(originalMetrics.memoryUsed)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">컴포넌트 수</span>
                    <span className="font-mono font-semibold">
                      {originalMetrics.componentCount}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  측정 대기 중...
                </div>
              )}
            </div>

            {/* Optimized Dashboard */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                최적화 대시보드 (React Compiler)
              </h2>
              {optimizedMetrics ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">초기 렌더링 시간</span>
                    <span className="font-mono font-semibold">
                      {optimizedMetrics.renderTime.toFixed(2)}ms
                      {originalMetrics && (
                        <span className={`ml-2 text-sm ${
                          optimizedMetrics.renderTime < originalMetrics.renderTime
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          ({calculateImprovement(originalMetrics.renderTime, optimizedMetrics.renderTime)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">리렌더링 시간</span>
                    <span className="font-mono font-semibold">
                      {optimizedMetrics.reRenderTime.toFixed(2)}ms
                      {originalMetrics && (
                        <span className={`ml-2 text-sm ${
                          optimizedMetrics.reRenderTime < originalMetrics.reRenderTime
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          ({calculateImprovement(originalMetrics.reRenderTime, optimizedMetrics.reRenderTime)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">메모리 사용량</span>
                    <span className="font-mono font-semibold">
                      {formatBytes(optimizedMetrics.memoryUsed)}
                      {originalMetrics && (
                        <span className={`ml-2 text-sm ${
                          optimizedMetrics.memoryUsed < originalMetrics.memoryUsed
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          ({calculateImprovement(originalMetrics.memoryUsed, optimizedMetrics.memoryUsed)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">컴포넌트 수</span>
                    <span className="font-mono font-semibold">
                      {optimizedMetrics.componentCount}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  측정 대기 중...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {originalMetrics && optimizedMetrics && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📊 React Compiler 최적화 효과
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {calculateImprovement(originalMetrics.renderTime, optimizedMetrics.renderTime)}
                </div>
                <div className="text-sm text-gray-600">렌더링 속도</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {calculateImprovement(originalMetrics.reRenderTime, optimizedMetrics.reRenderTime)}
                </div>
                <div className="text-sm text-gray-600">리렌더링 속도</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {calculateImprovement(originalMetrics.memoryUsed, optimizedMetrics.memoryUsed)}
                </div>
                <div className="text-sm text-gray-600">메모리 효율</div>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  0줄
                </div>
                <div className="text-sm text-gray-600">수동 최적화 코드</div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <h4 className="font-semibold text-gray-900">React Compiler 자동 최적화 기능:</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  컴포넌트 자동 메모이제이션 (React.memo 불필요)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  콜백 함수 자동 최적화 (useCallback 불필요)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  계산값 자동 캐싱 (useMemo 불필요)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  불필요한 리렌더링 자동 제거
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}