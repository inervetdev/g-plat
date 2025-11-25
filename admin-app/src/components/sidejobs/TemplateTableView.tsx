// Template Table View Component
// 템플릿 테이블 뷰 컴포넌트

import { Edit, Users, ExternalLink, MoreVertical } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { CATEGORY_LABELS } from '@/types/sidejob'
import type { AdminSidejobTemplate } from '@/types/sidejob'

interface TemplateTableViewProps {
  templates: AdminSidejobTemplate[]
  onEdit: (template: AdminSidejobTemplate) => void
  onViewInstances: (template: AdminSidejobTemplate) => void
}

export function TemplateTableView({ templates, onEdit, onViewInstances }: TemplateTableViewProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLTableCellElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                템플릿
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                파트너
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                할당
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                클릭
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                전환
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                전환율
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                상태
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {templates.map((template) => {
              const conversionRate = template.total_clicks > 0
                ? ((template.total_conversions / template.total_clicks) * 100).toFixed(1)
                : '0'

              return (
                <tr key={template.id} className="hover:bg-gray-50">
                  {/* Template Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {template.image_url ? (
                        <img
                          src={template.image_url}
                          alt={template.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-xl">📦</span>
                        </div>
                      )}
                      <div className="min-w-0 max-w-[180px]">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">{template.title}</span>
                          {template.badge && (
                            <span className={`px-1.5 py-0.5 text-xs font-semibold rounded flex-shrink-0 ${
                              template.badge === 'HOT' ? 'bg-red-100 text-red-600' :
                              template.badge === 'NEW' ? 'bg-blue-100 text-blue-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {template.badge}
                            </span>
                          )}
                        </div>
                        {template.price && (
                          <p className="text-sm text-blue-600 font-medium truncate">{template.price}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      {CATEGORY_LABELS[template.category] || template.category}
                    </span>
                  </td>

                  {/* Partner */}
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px]">
                    <span className="truncate block">{template.partner_name || '-'}</span>
                  </td>

                  {/* Instances */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-gray-900">
                      {template.total_instances.toLocaleString()}
                    </span>
                  </td>

                  {/* Clicks */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-gray-900">
                      {template.total_clicks.toLocaleString()}
                    </span>
                  </td>

                  {/* Conversions */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-gray-900">
                      {template.total_conversions.toLocaleString()}
                    </span>
                  </td>

                  {/* Conversion Rate */}
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-medium ${
                      parseFloat(conversionRate) >= 5 ? 'text-green-600' :
                      parseFloat(conversionRate) >= 1 ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {conversionRate}%
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      template.is_active
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {template.is_active ? '활성' : '비활성'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center relative" ref={activeMenu === template.id ? menuRef : null}>
                    <button
                      onClick={() => setActiveMenu(activeMenu === template.id ? null : template.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>

                    {activeMenu === template.id && (
                      <div className="absolute right-4 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => {
                            setActiveMenu(null)
                            onEdit(template)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          편집
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenu(null)
                            onViewInstances(template)
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
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
