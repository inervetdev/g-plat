import { useState, useRef, useEffect } from 'react'
import { Bell, Search, LogOut, User, Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { adminUser, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Force navigation even if error
      navigate('/login')
    }
  }

  const roleLabels = {
    super_admin: 'Super Admin',
    content_admin: 'Content Admin',
    marketing_admin: 'Marketing Admin',
    viewer: 'Viewer',
  }

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section: Logo + Search */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">G</span>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">G-PLAT Admin</h1>
                <p className="text-xs text-gray-500">관리자 대시보드</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative ml-8">
              <input
                type="text"
                placeholder="검색..."
                className="w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Right Section: Notifications + Profile */}
          <div className="flex items-center gap-4">
            {/* Notification Button */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Section with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg py-1 px-2 transition"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${adminUser?.name || 'Admin'}&background=3B82F6&color=fff`}
                  className="w-10 h-10 rounded-full"
                  alt={adminUser?.name || 'Admin'}
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-700">{adminUser?.name || '관리자'}</p>
                  <p className="text-xs text-gray-500">
                    {adminUser ? roleLabels[adminUser.role] : 'Loading...'}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{adminUser?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{adminUser?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      // Navigate to profile page (to be implemented)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    내 프로필
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      // Navigate to settings page (to be implemented)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    설정
                  </button>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
