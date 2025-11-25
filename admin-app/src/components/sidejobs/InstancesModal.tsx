// Instances Modal Component - Assignment Management
// 템플릿 할당 관리 모달 컴포넌트

import { useState } from 'react'
import {
  X,
  Plus,
  Search,
  Users,
  User,
  Crown,
  Globe,
  Loader2,
  ExternalLink,
  Trash2,
  Edit,
  MousePointerClick,
  TrendingUp,
} from 'lucide-react'
import {
  useInstancesByTemplate,
  useCreateInstance,
  useUpdateInstance,
  useDeleteInstance,
  useSearchUsersForAssignment,
} from '@/hooks/useSidejobs'
import { ASSIGNMENT_TARGET_LABELS, INSTANCE_TYPE_LABELS } from '@/types/sidejob'
import type {
  AdminSidejobTemplate,
  AdminSidejobInstanceWithTemplate,
  AdminSidejobInstanceInput,
  AssignmentTarget,
  SidejobInstanceType,
} from '@/types/sidejob'

interface InstancesModalProps {
  template: AdminSidejobTemplate
  isOpen: boolean
  onClose: () => void
}

type TabType = 'list' | 'create'

export function InstancesModal({ template, isOpen, onClose }: InstancesModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('list')

  const { data: instances, isLoading, refetch } = useInstancesByTemplate(template.id)

  const handleSuccess = () => {
    setActiveTab('list')
    refetch()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">할당 관리</h2>
            <p className="text-sm text-gray-600">{template.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'list'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              할당 목록 ({instances?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition flex items-center gap-1 ${
                activeTab === 'create'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              새 할당
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'list' ? (
            <InstancesList
              instances={instances || []}
              isLoading={isLoading}
              onRefetch={refetch}
            />
          ) : (
            <CreateInstanceForm
              template={template}
              onSuccess={handleSuccess}
              onCancel={() => setActiveTab('list')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Instances List Component
// ============================================================================

interface InstancesListProps {
  instances: AdminSidejobInstanceWithTemplate[]
  isLoading: boolean
  onRefetch: () => void
}

function InstancesList({ instances, isLoading, onRefetch }: InstancesListProps) {
  const deleteMutation = useDeleteInstance()
  const [editingInstance, setEditingInstance] = useState<AdminSidejobInstanceWithTemplate | null>(null)

  const handleDelete = async (instanceId: string) => {
    if (!confirm('이 할당을 삭제하시겠습니까?')) return

    try {
      await deleteMutation.mutateAsync(instanceId)
      onRefetch()
    } catch (error) {
      console.error('Failed to delete instance:', error)
      alert('할당 삭제에 실패했습니다')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (instances.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">할당된 인스턴스가 없습니다</h3>
        <p className="text-gray-600">새 할당 탭에서 사용자 또는 그룹에 할당해주세요</p>
      </div>
    )
  }

  // Group instances by assignment target
  const groupedInstances = instances.reduce((acc, instance) => {
    const target = instance.assignment_target
    if (!acc[target]) {
      acc[target] = []
    }
    acc[target].push(instance)
    return acc
  }, {} as Record<AssignmentTarget, AdminSidejobInstanceWithTemplate[]>)

  return (
    <div className="space-y-6">
      {/* Group assignments first */}
      {(['all_users', 'paid_users', 'free_users'] as AssignmentTarget[]).map((target) => {
        const targetInstances = groupedInstances[target]
        if (!targetInstances || targetInstances.length === 0) return null

        return (
          <div key={target} className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              {target === 'all_users' && <Globe className="w-5 h-5 text-blue-600" />}
              {target === 'paid_users' && <Crown className="w-5 h-5 text-yellow-600" />}
              {target === 'free_users' && <Users className="w-5 h-5 text-green-600" />}
              {ASSIGNMENT_TARGET_LABELS[target]}
            </h3>

            {targetInstances.map((instance) => (
              <InstanceCard
                key={instance.id}
                instance={instance}
                onEdit={() => setEditingInstance(instance)}
                onDelete={() => handleDelete(instance.id)}
              />
            ))}
          </div>
        )
      })}

      {/* Specific user assignments */}
      {groupedInstances.specific_user && groupedInstances.specific_user.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            개별 사용자 할당 ({groupedInstances.specific_user.length})
          </h3>

          <div className="space-y-2">
            {groupedInstances.specific_user.map((instance) => (
              <InstanceCard
                key={instance.id}
                instance={instance}
                onEdit={() => setEditingInstance(instance)}
                onDelete={() => handleDelete(instance.id)}
                showUser
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingInstance && (
        <EditInstanceModal
          instance={editingInstance}
          onClose={() => setEditingInstance(null)}
          onSuccess={() => {
            setEditingInstance(null)
            onRefetch()
          }}
        />
      )}
    </div>
  )
}

// ============================================================================
// Instance Card Component
// ============================================================================

interface InstanceCardProps {
  instance: AdminSidejobInstanceWithTemplate
  onEdit: () => void
  onDelete: () => void
  showUser?: boolean
}

function InstanceCard({ instance, onEdit, onDelete, showUser }: InstanceCardProps) {
  const conversionRate = instance.click_count > 0
    ? ((instance.conversion_count / instance.click_count) * 100).toFixed(1)
    : '0'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {showUser && instance.user && (
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-900">{instance.user.name}</span>
              <span className="text-sm text-gray-500">{instance.user.email}</span>
              <span className={`px-1.5 py-0.5 text-xs rounded ${
                instance.user.subscription_tier === 'PREMIUM' || instance.user.subscription_tier === 'BUSINESS'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {instance.user.subscription_tier}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <span className={`px-2 py-0.5 rounded ${
              instance.instance_type === 'paid'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {INSTANCE_TYPE_LABELS[instance.instance_type]}
            </span>

            <a
              href={instance.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1 truncate max-w-xs"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{instance.cta_url}</span>
            </a>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MousePointerClick className="w-3.5 h-3.5" />
              {instance.click_count.toLocaleString()} 클릭
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {conversionRate}% 전환
            </span>
            {instance.commission_rate > 0 && (
              <span>수수료: {instance.commission_rate.toLocaleString()}원</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="편집"
          >
            <Edit className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded-lg transition"
            title="삭제"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Create Instance Form Component
// ============================================================================

interface CreateInstanceFormProps {
  template: AdminSidejobTemplate
  onSuccess: () => void
  onCancel: () => void
}

function CreateInstanceForm({ template, onSuccess, onCancel }: CreateInstanceFormProps) {
  const createMutation = useCreateInstance()

  const [assignmentTarget, setAssignmentTarget] = useState<AssignmentTarget>('all_users')
  const [instanceType, setInstanceType] = useState<SidejobInstanceType>('free')
  const [ctaUrl, setCtaUrl] = useState(template.base_cta_link)
  const [commissionRate, setCommissionRate] = useState(0)
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email: string } | null>(null)

  const { data: searchResults } = useSearchUsersForAssignment(
    userSearch,
    instanceType === 'paid' ? undefined : 'FREE'
  )

  const handleSubmit = async () => {
    if (!ctaUrl.trim()) {
      alert('URL을 입력해주세요')
      return
    }

    if (assignmentTarget === 'specific_user' && !selectedUser) {
      alert('사용자를 선택해주세요')
      return
    }

    const input: AdminSidejobInstanceInput = {
      template_id: template.id,
      assignment_target: assignmentTarget,
      instance_type: instanceType,
      cta_url: ctaUrl,
      user_id: selectedUser?.id || null,
      commission_rate: commissionRate,
    }

    try {
      await createMutation.mutateAsync(input)
      onSuccess()
    } catch (error) {
      console.error('Failed to create instance:', error)
      alert('할당 생성에 실패했습니다')
    }
  }

  return (
    <div className="space-y-6">
      {/* Assignment Target */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">할당 대상</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(['all_users', 'paid_users', 'free_users', 'specific_user'] as AssignmentTarget[]).map((target) => (
            <button
              key={target}
              onClick={() => {
                setAssignmentTarget(target)
                if (target !== 'specific_user') {
                  setSelectedUser(null)
                }
                // Auto-set instance type
                if (target === 'free_users') {
                  setInstanceType('free')
                } else if (target === 'paid_users') {
                  setInstanceType('paid')
                }
              }}
              className={`p-3 rounded-lg border text-sm font-medium transition ${
                assignmentTarget === target
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-blue-300 text-gray-700'
              }`}
            >
              {ASSIGNMENT_TARGET_LABELS[target]}
            </button>
          ))}
        </div>
      </div>

      {/* User Search (for specific_user) */}
      {assignmentTarget === 'specific_user' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">사용자 검색</label>
          {selectedUser ? (
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">{selectedUser.name}</span>
                <span className="text-sm text-gray-500 ml-2">{selectedUser.email}</span>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-blue-600 text-sm hover:underline"
              >
                변경
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="이름 또는 이메일로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {searchResults && searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user)
                        setUserSearch('')
                        // Set instance type based on subscription
                        setInstanceType(
                          user.subscription_tier === 'PREMIUM' || user.subscription_tier === 'BUSINESS'
                            ? 'paid'
                            : 'free'
                        )
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{user.email}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        user.subscription_tier === 'PREMIUM' || user.subscription_tier === 'BUSINESS'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.subscription_tier}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Instance Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">인스턴스 타입</label>
        <div className="grid grid-cols-2 gap-2">
          {(['paid', 'free'] as SidejobInstanceType[]).map((type) => (
            <button
              key={type}
              onClick={() => setInstanceType(type)}
              disabled={
                (assignmentTarget === 'free_users' && type === 'paid') ||
                (assignmentTarget === 'paid_users' && type === 'free')
              }
              className={`p-3 rounded-lg border text-sm font-medium transition ${
                instanceType === type
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-blue-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {INSTANCE_TYPE_LABELS[type]}
              <p className="text-xs font-normal mt-1 text-gray-500">
                {type === 'paid' ? '개별 URL, 개별 수수료' : '공통 URL, 회사 수수료'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* CTA URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={ctaUrl}
          onChange={(e) => setCtaUrl(e.target.value)}
          placeholder="https://partner.com/affiliate?ref=xxx"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {instanceType === 'paid'
            ? '유료 회원용 개별 추적 URL을 입력하세요'
            : '무료 회원용 공통 URL을 입력하세요 (기본값: 템플릿 기본 URL)'}
        </p>
      </div>

      {/* Commission Rate (for paid instances) */}
      {instanceType === 'paid' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">건당 수수료</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
              min="0"
              step="1000"
              className="w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600">원</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          할당 생성
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Edit Instance Modal Component
// ============================================================================

interface EditInstanceModalProps {
  instance: AdminSidejobInstanceWithTemplate
  onClose: () => void
  onSuccess: () => void
}

function EditInstanceModal({ instance, onClose, onSuccess }: EditInstanceModalProps) {
  const updateMutation = useUpdateInstance()

  const [ctaUrl, setCtaUrl] = useState(instance.cta_url)
  const [commissionRate, setCommissionRate] = useState(instance.commission_rate)
  const [commissionEarned, setCommissionEarned] = useState(instance.commission_earned)
  const [isActive, setIsActive] = useState(instance.is_active)

  const handleSubmit = async () => {
    try {
      await updateMutation.mutateAsync({
        instanceId: instance.id,
        input: {
          cta_url: ctaUrl,
          commission_rate: commissionRate,
          commission_earned: commissionEarned,
          is_active: isActive,
        },
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to update instance:', error)
      alert('할당 수정에 실패했습니다')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">할당 수정</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">건당 수수료</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                min="0"
                className="w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">원</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정산된 수수료</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={commissionEarned}
                onChange={(e) => setCommissionEarned(parseFloat(e.target.value) || 0)}
                min="0"
                className="w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">원</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">활성화</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
