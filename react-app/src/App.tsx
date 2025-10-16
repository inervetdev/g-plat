import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

// Lazy load pages - grouped by priority
// High priority (likely first visit)
const LandingPage = lazy(() => import('./pages/LandingPage'))
const NewLoginPage = lazy(() => import('./pages/NewLoginPage'))
const NewRegisterPage = lazy(() => import('./pages/NewRegisterPage'))

// Medium priority (authenticated users) - React Compiler Optimized
const DashboardPage = lazy(() => import('./pages/DashboardPageOptimized')) // Using optimized version
const CardViewPage = lazy(() => import('./pages/CardViewPage'))
const CardManagePage = lazy(() => import('./pages/CardManagePageOptimized')) // Using optimized version
const CreateCardPage = lazy(() => import('./pages/CreateCardPageOptimized')) // Using optimized version
const EditCardPage = lazy(() => import('./pages/EditCardPageOptimized').then(module => ({ default: module.EditCardPageOptimized }))) // Using optimized version
const SideJobCardsPage = lazy(() => import('./pages/SideJobCardsPageOptimized')) // Using optimized version

// Low priority (analytics, stats) - React Compiler Optimized
const StatsPage = lazy(() => import('./pages/StatsPageOptimized')) // Using optimized version

// Original versions removed - using React Compiler optimized versions only
const QRCodePage = lazy(() => import('./pages/QRCodePage'))
const QRStatsPage = lazy(() => import('./pages/QRStatsPage'))
const PerformanceComparisonPage = lazy(() => import('./pages/PerformanceComparisonPage'))

// Demo/Test pages
const DemoCardPage = lazy(() => import('./pages/DemoCardPage'))
const TestPage = lazy(() => import('./pages/TestPage'))
const TestQRPage = lazy(() => import('./pages/TestQRPage'))
const OptimizationTestPage = lazy(() => import('./pages/OptimizationTestPage'))

// Legal pages
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))

function App() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner message="페이지 로딩 중..." />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<NewLoginPage />} />
              <Route path="/register" element={<NewRegisterPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/demo" element={<DemoCardPage />} />

              {/* Public card view */}
              <Route path="/card/:userId" element={<CardViewPage />} />

              {/* Authenticated routes - React Compiler Optimized by default */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/card-manage" element={<CardManagePage />} />
              <Route path="/create-card" element={<CreateCardPage />} />
              <Route path="/edit-card/:cardId" element={<EditCardPage />} />
              <Route path="/sidejob-cards" element={<SideJobCardsPage />} />

              {/* Analytics routes - React Compiler Optimized by default */}
              <Route path="/stats" element={<StatsPage />} />

              <Route path="/qr/:cardId" element={<QRCodePage />} />
              <Route path="/qr-stats/:shortCode" element={<QRStatsPage />} />

              {/* Test routes */}
              <Route path="/test" element={<TestPage />} />
              <Route path="/test-qr" element={<TestQRPage />} />
              <Route path="/performance" element={<PerformanceComparisonPage />} />
              <Route path="/optimization-test" element={<OptimizationTestPage />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

// Enhanced loading spinner component with optional message
function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          {/* Inner pulsing dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        {message && (
          <p className="mt-4 text-gray-600 text-sm font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export default App
