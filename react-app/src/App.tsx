import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

// Lazy load components
const LandingPage = lazy(() => import('./pages/LandingPage'))
const NewLoginPage = lazy(() => import('./pages/NewLoginPage'))
const NewRegisterPage = lazy(() => import('./pages/NewRegisterPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CardViewPage = lazy(() => import('./pages/CardViewPage'))
const CardManagePage = lazy(() => import('./pages/CardManagePage'))
const DemoCardPage = lazy(() => import('./pages/DemoCardPage'))
const CreateCardPage = lazy(() => import('./pages/CreateCardPage'))
const EditCardPage = lazy(() => import('./pages/EditCardPage').then(module => ({ default: module.EditCardPage })))
const SideJobCardsPage = lazy(() => import('./pages/SideJobCardsPage'))
const TestPage = lazy(() => import('./pages/TestPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))
const QRCodePage = lazy(() => import('./pages/QRCodePage'))
const TestQRPage = lazy(() => import('./pages/TestQRPage'))
const QRStatsPage = lazy(() => import('./pages/QRStatsPage'))

function App() {
  const [isReady, setIsReady] = useState(false)
  const [error] = useState<string | null>(null)

  useEffect(() => {
    console.log('✅ App component mounted')
    // 의존성 체크를 건너뛰고 바로 준비 완료 상태로 변경
    setIsReady(true)
  }, [])

  // 로딩 상태
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">애플리케이션 로딩 중...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              에러: {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  // 메인 앱 - 단순 버전부터 시작
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
        <Route path="/" element={
          <Suspense fallback={<LoadingSpinner />}>
            <LandingPage />
          </Suspense>
        } />

        <Route path="/login" element={
          <Suspense fallback={<LoadingSpinner />}>
            <NewLoginPage />
          </Suspense>
        } />

        <Route path="/register" element={
          <Suspense fallback={<LoadingSpinner />}>
            <NewRegisterPage />
          </Suspense>
        } />

        <Route path="/demo" element={
          <Suspense fallback={<LoadingSpinner />}>
            <DemoCardPage />
          </Suspense>
        } />

        <Route path="/dashboard" element={
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardPage />
          </Suspense>
        } />

        <Route path="/terms" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TermsPage />
          </Suspense>
        } />

        <Route path="/privacy" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PrivacyPage />
          </Suspense>
        } />

        <Route path="/card/:userId" element={
          <Suspense fallback={<LoadingSpinner />}>
            <CardViewPage />
          </Suspense>
        } />

        <Route path="/card-manage" element={
          <Suspense fallback={<LoadingSpinner />}>
            <CardManagePage />
          </Suspense>
        } />

        <Route path="/create-card" element={
          <Suspense fallback={<LoadingSpinner />}>
            <CreateCardPage />
          </Suspense>
        } />

        <Route path="/edit-card/:cardId" element={
          <Suspense fallback={<LoadingSpinner />}>
            <EditCardPage />
          </Suspense>
        } />

        <Route path="/sidejob-cards" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SideJobCardsPage />
          </Suspense>
        } />

        <Route path="/test" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TestPage />
          </Suspense>
        } />

        <Route path="/stats" element={
          <Suspense fallback={<LoadingSpinner />}>
            <StatsPage />
          </Suspense>
        } />

        <Route path="/qr/:cardId" element={
          <Suspense fallback={<LoadingSpinner />}>
            <QRCodePage />
          </Suspense>
        } />

        <Route path="/test-qr" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TestQRPage />
          </Suspense>
        } />

        <Route path="/qr-stats/:shortCode" element={
          <Suspense fallback={<LoadingSpinner />}>
            <QRStatsPage />
          </Suspense>
        } />
        </Routes>
      </Router>
    </ThemeProvider>
  </AuthProvider>
  )
}

// 로딩 스피너 컴포넌트
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}

// 임시 간단한 페이지 컴포넌트 (미사용)
/*
function SimplePage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{title} 페이지</h2>
        <p className="text-gray-600 mb-4">이 페이지는 준비 중입니다.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}
*/

export default App
