import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  Briefcase,
  QrCode,
  Flag,
  BarChart3,
  Megaphone,
  Settings,
  History,
  ClipboardList
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number
}

function NavLink({ to, icon, label, badge }: NavLinkProps) {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <Link
      to={to}
      className={cn(
        'nav-link flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-600 font-medium'
          : 'text-gray-600 hover:bg-gray-50'
      )}
    >
      <span className="w-5 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-20 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-40">
      <nav className="p-4 space-y-1">
        {/* Main Menu Section */}
        <NavLink
          to="/dashboard"
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="대시보드"
        />
        <NavLink
          to="/users"
          icon={<Users className="w-5 h-5" />}
          label="사용자 관리"
          badge={142}
        />
        <NavLink
          to="/cards"
          icon={<CreditCard className="w-5 h-5" />}
          label="명함 관리"
        />
        <NavLink
          to="/user-sidejobs"
          icon={<Package className="w-5 h-5" />}
          label="부가명함 관리"
        />
        <NavLink
          to="/sidejobs"
          icon={<Briefcase className="w-5 h-5" />}
          label="제휴 부가명함 관리"
        />
        <NavLink
          to="/qr"
          icon={<QrCode className="w-5 h-5" />}
          label="QR 코드 관리"
        />

        {/* Operations Section */}
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            운영
          </p>
        </div>

        <NavLink
          to="/applications"
          icon={<ClipboardList className="w-5 h-5" />}
          label="상품 신청 관리"
        />
        <NavLink
          to="/reports"
          icon={<Flag className="w-5 h-5" />}
          label="신고 관리"
          badge={8}
        />
        <NavLink
          to="/analytics"
          icon={<BarChart3 className="w-5 h-5" />}
          label="통계 분석"
        />
        <NavLink
          to="/campaigns"
          icon={<Megaphone className="w-5 h-5" />}
          label="마케팅 캠페인"
        />

        {/* System Section */}
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            시스템
          </p>
        </div>

        <NavLink
          to="/settings"
          icon={<Settings className="w-5 h-5" />}
          label="설정"
        />
        <NavLink
          to="/logs"
          icon={<History className="w-5 h-5" />}
          label="감사 로그"
        />
      </nav>
    </aside>
  )
}
