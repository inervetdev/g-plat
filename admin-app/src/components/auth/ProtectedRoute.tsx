import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'super_admin' | 'content_admin' | 'marketing_admin' | 'viewer'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, isLoading, adminUser } = useAuthStore()

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('🔒 ProtectedRoute: isLoading =', isLoading, 'isAuthenticated =', isAuthenticated)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">인증 확인 중...</p>
          <p className="text-xs text-gray-400 mt-2">최대 10초 소요</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole && adminUser) {
    const roleHierarchy = {
      super_admin: 4,
      content_admin: 3,
      marketing_admin: 2,
      viewer: 1,
    }

    const userRoleLevel = roleHierarchy[adminUser.role]
    const requiredRoleLevel = roleHierarchy[requiredRole]

    // If user's role level is lower than required, show access denied
    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">접근 권한 없음</h2>
            <p className="text-gray-600 mb-6">
              이 페이지에 접근할 권한이 없습니다.
              <br />
              필요한 권한: <span className="font-semibold">{requiredRole}</span>
              <br />
              현재 권한: <span className="font-semibold">{adminUser.role}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              이전 페이지로
            </button>
          </div>
        </div>
      )
    }
  }

  // User is authenticated and has required role
  return <>{children}</>
}
