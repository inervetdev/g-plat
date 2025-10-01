import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ 오류가 발생했습니다</h1>
            <div className="bg-gray-100 rounded p-4 mb-4">
              <pre className="text-sm text-gray-700 overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </div>
            <p className="text-gray-600 mb-4">
              이 오류가 계속되면 페이지를 새로고침하거나 개발자 도구(F12)의 콘솔을 확인해주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary