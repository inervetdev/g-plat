// Template Card Component for Grid View
// 템플릿 카드 그리드 뷰 컴포넌트

import { MoreVertical, Edit, Users, ExternalLink, MousePointerClick, TrendingUp } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { CATEGORY_LABELS } from '@/types/sidejob'
import type { AdminSidejobTemplate } from '@/types/sidejob'

interface TemplateCardProps {
  template: AdminSidejobTemplate
  onEdit: () => void
  onViewInstances: () => void
}

export function TemplateCard({ template, onEdit, onViewInstances }: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const conversionRate = template.total_clicks > 0
    ? ((template.total_conversions / template.total_clicks) * 100).toFixed(1)
    : '0'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group">
      {/* Image */}
      <div className="relative aspect-video bg-gray-100">
        {template.image_url ? (
          <img
            src={template.image_url}
            alt={template.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📦</span>
          </div>
        )}

        {/* Badge */}
        {template.badge && (
          <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
            template.badge === 'HOT' ? 'bg-red-500 text-white' :
            template.badge === 'NEW' ? 'bg-blue-500 text-white' :
            'bg-yellow-500 text-white'
          }`}>
            {template.badge}
          </span>
        )}

        {/* Status */}
        {!template.is_active && (
          <span className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded bg-gray-500 text-white">
            비활성
          </span>
        )}

        {/* Menu */}
        <div className="absolute top-2 right-2" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className={`p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white transition ${
              template.is_active ? '' : 'mt-8'
            }`}
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  setShowMenu(false)
                  onEdit()
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                편집
              </button>
              <button
                onClick={() => {
                  setShowMenu(false)
                  onViewInstances()
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                할당 관리
              </button>
              <a
                href={template.base_cta_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                링크 열기
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
            {CATEGORY_LABELS[template.category] || template.category}
          </span>
          {template.partner_name && (
            <span className="text-xs text-gray-500">{template.partner_name}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{template.title}</h3>

        {/* Description */}
        {template.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
        )}

        {/* Price */}
        {template.price && (
          <p className="text-lg font-bold text-blue-600 mb-3">{template.price}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {template.total_instances}
            </span>
            <span className="flex items-center gap-1">
              <MousePointerClick className="w-3.5 h-3.5" />
              {template.total_clicks.toLocaleString()}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {conversionRate}%
          </span>
        </div>
      </div>
    </div>
  )
}
