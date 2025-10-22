import { Bell, Search } from 'lucide-react'

export function Header() {
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

            {/* Profile Section */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <img
                src="https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff"
                className="w-10 h-10 rounded-full"
                alt="Admin"
              />
              <div>
                <p className="text-sm font-semibold text-gray-700">관리자</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
