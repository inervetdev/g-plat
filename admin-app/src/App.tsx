import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function App() {
  const { checkAuth } = useAuthStore()

  // Check authentication on app mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Redirect root to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* User Management */}
          <Route
            path="users"
            element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">사용자 관리</h2>
                <p className="text-gray-600">개발 예정</p>
              </div>
            }
          />

          {/* Business Card Management */}
          <Route
            path="cards"
            element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">명함 관리</h2>
                <p className="text-gray-600">개발 예정</p>
              </div>
            }
          />

          {/* Sidejob Management */}
          <Route
            path="sidejobs"
            element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">부가명함 관리</h2>
                <p className="text-gray-600">개발 예정</p>
              </div>
            }
          />

          {/* QR Code Management */}
          <Route
            path="qr"
            element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">QR 코드</h2>
                <p className="text-gray-600">개발 예정</p>
              </div>
            }
          />

          {/* Reports */}
          <Route
            path="reports"
            element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">신고 관리</h2>
                <p className="text-gray-600">개발 예정</p>
              </div>
            }
          />

          {/* Analytics */}
          <Route
            path="analytics"
            element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">통계 분석</h2>
                <p className="text-gray-600">개발 예정</p>
              </div>
            }
          />

          {/* Campaigns */}
          <Route
            path="campaigns"
            element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">마케팅 캠페인</h2>
                <p className="text-gray-600">개발 예정</p>
              </div>
            }
          />

          {/* Settings (Super Admin Only) */}
          <Route
            path="settings"
            element={
              <ProtectedRoute requiredRole="super_admin">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">설정</h2>
                  <p className="text-gray-600">개발 예정 (Super Admin 전용)</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Audit Logs (Super Admin Only) */}
          <Route
            path="logs"
            element={
              <ProtectedRoute requiredRole="super_admin">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">감사 로그</h2>
                  <p className="text-gray-600">개발 예정 (Super Admin 전용)</p>
                </div>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
