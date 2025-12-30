import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ThemePreviewModal from '../components/ThemePreviewModal'
import FilePreviewModal from '../components/FilePreviewModal'
import { AddressSearchModal } from '../components/AddressSearchModal'
import { MapPreview } from '../components/MapPreview'
import type { ThemeName } from '../contexts/ThemeContext'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface AttachmentFile {
  id: string
  file?: File
  title: string
  filename?: string
  file_url?: string
  file_size?: number
  file_type?: string
  isExisting?: boolean
  youtube_url?: string
  youtube_display_mode?: 'modal' | 'inline'
  attachment_type?: 'file' | 'youtube'
}

// React Compiler가 자동으로 최적화 - 수동 memo, useCallback, useMemo 불필요!
export function EditCardPageOptimized() {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([])
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null)
  const [showAddressSearch, setShowAddressSearch] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [mapCoords, setMapCoords] = useState<{latitude: number, longitude: number} | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    title: '',
    company: '',
    department: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    address_detail: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    github: '',
    tiktok: '',
    threads: '',
    introduction: '',
    services: '',
    skills: '',
    theme: 'trendy' as ThemeName,
    custom_url: '',
    is_primary: false,
    is_active: true
  })

  // React Compiler가 자동으로 최적화
  const normalizeUrl = (url: string): string => {
    if (!url) return ''
    // 이미 http:// 또는 https://로 시작하면 그대로 반환
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // https:// 자동 추가
    return `https://${url}`
  }

  useEffect(() => {
    loadCardData()
  }, [cardId])

  // React Compiler가 자동으로 최적화
  const loadCardData = async () => {
    try {
      const { data: card, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('id', cardId)
        .single()

      if (error) throw error

      if (card) {
        const cardAny = card as any
        setFormData({
          name: cardAny.name || '',
          name_en: cardAny.name_en || '',
          title: cardAny.title || '',
          company: cardAny.company || '',
          department: cardAny.department || '',
          phone: cardAny.phone || '',
          email: cardAny.email || '',
          website: cardAny.website || '',
          address: cardAny.address || '',
          address_detail: cardAny.address_detail || '',
          linkedin: cardAny.linkedin || '',
          instagram: cardAny.instagram || '',
          facebook: cardAny.facebook || '',
          twitter: cardAny.twitter || '',
          youtube: cardAny.youtube || '',
          github: cardAny.github || '',
          tiktok: cardAny.tiktok || '',
          threads: cardAny.threads || '',
          introduction: cardAny.introduction || '',
          services: cardAny.services?.join(', ') || '',
          skills: cardAny.skills?.join(', ') || '',
          theme: (cardAny.theme as ThemeName) || 'trendy',
          custom_url: cardAny.custom_url || '',
          is_primary: cardAny.is_primary || false,
          is_active: cardAny.is_active || true
        })

        // Load existing attachments
        const { data: attachments } = await supabase
          .from('card_attachments' as any)
          .select('*')
          .eq('business_card_id', cardId)
          .order('display_order', { ascending: true })

        if (attachments) {
          const existingAttachments: AttachmentFile[] = (attachments as any[]).map((att: any) => ({
            id: att.id,
            title: att.title,
            filename: att.filename,
            file_url: att.file_url,
            file_size: att.file_size,
            file_type: att.file_type,
            youtube_url: att.youtube_url,
            youtube_display_mode: att.youtube_display_mode || 'modal',
            attachment_type: att.attachment_type || 'file',
            isExisting: true
          }))
          setAttachmentFiles(existingAttachments)
        }

        // Load map coordinates if available
        if (card.latitude && card.longitude) {
          setMapCoords({
            latitude: card.latitude,
            longitude: card.longitude
          })
          setShowMap(true)
        }
      }
    } catch (error) {
      console.error('Error loading card:', error)
      alert('명함을 불러올 수 없습니다')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // React Compiler가 자동으로 최적화
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    const validFiles = files.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name}: 파일 크기는 50MB 이하여야 합니다.`)
        return false
      }
      return true
    })

    const newAttachments: AttachmentFile[] = validFiles.map(file => ({
      id: `new-${Date.now()}-${Math.random()}`,
      file,
      title: file.name.split('.').slice(0, -1).join('.'),
      filename: file.name,
      file_size: file.size,
      file_type: file.type,
      attachment_type: 'file',
      isExisting: false
    }))

    setAttachmentFiles(prev => [...prev, ...newAttachments])
    e.target.value = ''
  }

  // React Compiler가 자동으로 최적화
  const addYouTubeUrl = (url: string, title: string, displayMode: 'modal' | 'inline' = 'modal') => {
    const newAttachment: AttachmentFile = {
      id: `youtube-${Date.now()}-${Math.random()}`,
      title: title || 'YouTube 영상',
      youtube_url: url,
      youtube_display_mode: displayMode,
      attachment_type: 'youtube',
      isExisting: false
    }
    setAttachmentFiles(prev => [...prev, newAttachment])
  }

  // React Compiler가 자동으로 최적화
  const updateYouTubeDisplayMode = (id: string, mode: 'modal' | 'inline') => {
    setAttachmentFiles(prev =>
      prev.map(att => att.id === id ? { ...att, youtube_display_mode: mode } : att)
    )
  }

  // React Compiler가 자동으로 최적화
  const updateAttachmentTitle = (id: string, title: string) => {
    setAttachmentFiles(prev =>
      prev.map(att => att.id === id ? { ...att, title } : att)
    )
  }

  // React Compiler가 자동으로 최적화
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setAttachmentFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // React Compiler가 자동으로 최적화
  const removeAttachment = async (attachment: AttachmentFile) => {
    if (attachment.isExisting) {
      const { error } = await supabase
        .from('card_attachments' as any)
        .delete()
        .eq('id', attachment.id)

      if (error) {
        console.error('Error deleting attachment:', error)
        alert('첨부파일 삭제 중 오류가 발생했습니다.')
        return
      }
    }
    setAttachmentFiles(prev => prev.filter(att => att.id !== attachment.id))
  }

  // React Compiler가 자동으로 최적화
  const previewAttachment = (attachment: AttachmentFile) => {
    if (attachment.attachment_type === 'youtube' && attachment.youtube_url) {
      setPreviewFile({
        url: attachment.youtube_url,
        name: attachment.title,
        type: 'video/youtube'
      })
    } else if (attachment.file) {
      const url = URL.createObjectURL(attachment.file)
      setPreviewFile({
        url,
        name: attachment.filename || attachment.title,
        type: attachment.file_type || 'application/octet-stream'
      })
    } else if (attachment.file_url) {
      setPreviewFile({
        url: attachment.file_url,
        name: attachment.filename || attachment.title,
        type: attachment.file_type || 'application/octet-stream'
      })
    }
  }

  // React Compiler가 자동으로 최적화
  const uploadAttachments = async (files: AttachmentFile[], userId: string) => {
    const results = []

    for (const attachment of files) {
      // YouTube 첨부파일 처리
      if (attachment.attachment_type === 'youtube' && attachment.youtube_url) {
        results.push({
          id: attachment.id,
          title: attachment.title,
          youtube_url: attachment.youtube_url,
          youtube_display_mode: attachment.youtube_display_mode || 'modal',
          attachment_type: 'youtube'
        })
        continue
      }

      // 파일 첨부파일 처리
      if (!attachment.file) continue

      try {
        const fileExt = attachment.filename?.split('.').pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
        const filePath = `${userId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('card-attachments')
          .upload(filePath, attachment.file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('card-attachments')
          .getPublicUrl(filePath)

        results.push({
          id: attachment.id,
          title: attachment.title,
          filename: attachment.filename,
          file_url: data.publicUrl,
          file_size: attachment.file_size,
          file_type: attachment.file_type,
          attachment_type: 'file'
        })
      } catch (error) {
        console.error(`Upload failed: ${attachment.filename}`, error)
        throw error
      }
    }

    return results
  }

  // React Compiler가 자동으로 최적화
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const { error } = await supabase
        .from('business_cards')
        .update({
          name: formData.name,
          name_en: formData.name_en || null,
          title: formData.title,
          company: formData.company,
          department: formData.department,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          address: formData.address,
          address_detail: formData.address_detail,
          latitude: mapCoords?.latitude || null,
          longitude: mapCoords?.longitude || null,
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          facebook: formData.facebook,
          twitter: formData.twitter,
          youtube: formData.youtube,
          github: formData.github,
          tiktok: formData.tiktok || null,
          threads: formData.threads || null,
          introduction: formData.introduction,
          services: formData.services ? formData.services.split(',').map(s => s.trim()) : [],
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
          theme: formData.theme,
          custom_url: formData.custom_url,
          is_primary: formData.is_primary,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardId)
        .eq('user_id', user.id)

      // Check for RLS policy errors (deleted or suspended users)
      if (error) {
        if (error.message?.includes('row-level security') || error.message?.includes('RLS') || error.message?.includes('permission denied')) {
          alert('계정이 정지되었거나 삭제되었습니다.\n관리자에게 문의하시기 바랍니다.')
          setSaving(false)
          return
        }
        throw error
      }

      // Upload new attachments (including YouTube)
      const newAttachments = attachmentFiles.filter(att => !att.isExisting)
      if (newAttachments.length > 0) {
        setUploadingAttachment(true)
        try {
          const uploadedFiles = await uploadAttachments(newAttachments, user.id)

          const attachmentRecords = uploadedFiles.map((file, index) => ({
            business_card_id: cardId,
            user_id: user.id,
            title: file.title,
            filename: file.filename,
            file_url: file.file_url,
            file_size: file.file_size,
            file_type: file.file_type,
            youtube_url: file.youtube_url,
            youtube_display_mode: file.youtube_display_mode,
            attachment_type: file.attachment_type,
            display_order: attachmentFiles.filter(a => a.isExisting).length + index
          }))

          const { error: attachmentError } = await supabase
            .from('card_attachments' as any)
            .insert(attachmentRecords)

          if (attachmentError) {
            console.error('Error saving attachments:', attachmentError)
          }
        } catch (error) {
          console.error('Error uploading attachments:', error)
        } finally {
          setUploadingAttachment(false)
        }
      }

      // Update existing attachments (including YouTube display mode and display_order)
      const existingAttachments = attachmentFiles.filter(att => att.isExisting)
      for (let i = 0; i < existingAttachments.length; i++) {
        const att = existingAttachments[i]
        const updateData: any = {
          title: att.title,
          display_order: attachmentFiles.indexOf(att)  // Update display order based on current position
        }

        // YouTube 첨부파일인 경우 display_mode도 업데이트
        if (att.attachment_type === 'youtube') {
          updateData.youtube_display_mode = att.youtube_display_mode || 'modal'
        }

        await supabase
          .from('card_attachments' as any)
          .update(updateData)
          .eq('id', att.id)
      }

      alert('명함이 수정되었습니다!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error updating card:', error)
      alert('명함 수정에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  // React Compiler가 자동으로 최적화
  const handleDelete = async () => {
    if (!confirm('정말 이 명함을 삭제하시겠습니까?')) {
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const { error } = await supabase
        .from('business_cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id)

      // Check for RLS policy errors (deleted or suspended users)
      if (error) {
        if ((error as any).message?.includes('row-level security') || (error as any).message?.includes('RLS') || (error as any).message?.includes('permission denied')) {
          alert('계정이 정지되었거나 삭제되었습니다.\n관리자에게 문의하시기 바랍니다.')
          return
        }
        throw error
      }

      alert('명함이 삭제되었습니다')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error deleting card:', error)
      alert('명함 삭제에 실패했습니다')
    }
  }

  // React Compiler가 자동으로 최적화 - 컴포넌트 추출
  const SortableAttachmentItem = ({ attachment }: { attachment: AttachmentFile }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: attachment.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded transition-colors"
          title="드래그하여 순서 변경"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={attachment.title}
              onChange={(e) => updateAttachmentTitle(attachment.id, e.target.value)}
              placeholder="파일 제목"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
            {attachment.attachment_type === 'youtube' && (
              <>
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">YouTube</span>
                <select
                  value={attachment.youtube_display_mode || 'modal'}
                  onChange={(e) => updateYouTubeDisplayMode(attachment.id, e.target.value as 'modal' | 'inline')}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  title="표시 방식"
                >
                  <option value="modal">모달</option>
                  <option value="inline">인라인</option>
                </select>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {attachment.isExisting && <span className="text-green-600">✓ 저장됨 · </span>}
            {!attachment.isExisting && <span className="text-blue-600">새 파일 · </span>}
            {attachment.attachment_type === 'youtube'
              ? attachment.youtube_url
              : `${attachment.filename} (${((attachment.file_size || 0) / 1024).toFixed(1)}KB)`
            }
          </p>
        </div>
        <button
          type="button"
          onClick={() => previewAttachment(attachment)}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
        >
          미리보기
        </button>
        <button
          type="button"
          onClick={() => removeAttachment(attachment)}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors whitespace-nowrap"
        >
          삭제
        </button>
      </div>
    )
  }

  // React Compiler가 자동으로 최적화 - 폼 필드 컴포넌트
  const FormField = ({ label, name, type = 'text', required = false, placeholder = '' }: {
    label: string
    name: keyof typeof formData
    type?: string
    required?: boolean
    placeholder?: string
  }) => {
    const isWebsiteField = name === 'website'
    const isAddressField = name === 'address'

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {isAddressField ? (
          <div className="flex gap-2 mt-1">
            <input
              type={type}
              required={required}
              value={String(formData[name])}
              onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
              placeholder={placeholder || '주소를 입력하거나 검색하세요'}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowAddressSearch(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors whitespace-nowrap text-sm"
            >
              주소 검색
            </button>
          </div>
        ) : (
          <input
            type={isWebsiteField ? 'text' : type}
            required={required}
            value={String(formData[name])}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            onBlur={isWebsiteField ? (e) => {
              const normalized = normalizeUrl(e.target.value)
              setFormData({ ...formData, [name]: normalized })
            } : undefined}
            placeholder={isWebsiteField ? 'www.example.com 또는 example.com' : placeholder}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        )}
        {isWebsiteField && (
          <p className="text-xs text-gray-500 mt-1">
            http:// 또는 https:// 없이 입력하면 자동으로 추가됩니다
          </p>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">명함 수정</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Theme Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  테마 선택
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                >
                  테마 미리보기
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'trendy', label: '트렌디' },
                  { value: 'apple', label: '애플' },
                  { value: 'professional', label: '프로페셔널' },
                  { value: 'simple', label: '심플' },
                  { value: 'default', label: '기본' }
                ].map(theme => (
                  <label
                    key={theme.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.theme === theme.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={formData.theme === theme.value}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value as ThemeName })}
                      className="sr-only"
                    />
                    <span className="text-center block">{theme.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="이름" name="name" required />
                <FormField label="영문 이름" name="name_en" placeholder="Gil-dong Hong" />
                <FormField label="직책" name="title" placeholder="대표, 매니저 등" />
                <FormField label="회사" name="company" />
                <FormField label="부서" name="department" />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">연락처 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="전화번호" name="phone" type="tel" required />
                <FormField label="이메일" name="email" type="email" required />
                <FormField label="웹사이트" name="website" type="url" placeholder="https://" />
                <FormField label="주소" name="address" />
              </div>
              {/* 상세 주소 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상세 주소
                </label>
                <input
                  type="text"
                  name="address_detail"
                  value={formData.address_detail}
                  onChange={(e) => setFormData({ ...formData, address_detail: e.target.value })}
                  placeholder="동/호수, 건물명, 층수 등"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* 지도 미리보기 */}
              {showMap && mapCoords && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📍 지도 미리보기
                  </label>
                  <MapPreview
                    latitude={mapCoords.latitude}
                    longitude={mapCoords.longitude}
                    address={formData.address}
                    height="300px"
                    level={3}
                  />
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">소셜 미디어</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="LinkedIn" name="linkedin" placeholder="@username 또는 URL" />
                <FormField label="Instagram" name="instagram" placeholder="@username 또는 URL" />
                <FormField label="Facebook" name="facebook" placeholder="@username 또는 URL" />
                <FormField label="X (Twitter)" name="twitter" placeholder="@username 또는 URL" />
                <FormField label="YouTube" name="youtube" placeholder="@username 또는 URL" />
                <FormField label="GitHub" name="github" placeholder="@username 또는 URL" />
                <FormField label="TikTok" name="tiktok" placeholder="@username 또는 URL" />
                <FormField label="Threads" name="threads" placeholder="@username 또는 URL" />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  소개
                </label>
                <textarea
                  value={formData.introduction}
                  onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* 파일 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  첨부파일 업로드
                </label>
                <input
                  type="file"
                  onChange={handleAttachmentChange}
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov,.avi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  최대 50MB, 여러 파일 선택 가능
                </p>
              </div>

              {/* YouTube URL 추가 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube URL 추가
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="youtube-url-input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('youtube-url-input') as HTMLInputElement
                      const url = input.value.trim()
                      if (url) {
                        const title = prompt('영상 제목을 입력하세요:', 'YouTube 영상')
                        if (title) {
                          const displayMode = confirm('명함 화면에 영상을 직접 표시하시겠습니까?\n\n확인: 인라인 표시\n취소: 모달 표시')
                            ? 'inline' : 'modal'
                          addYouTubeUrl(url, title, displayMode)
                          input.value = ''
                        }
                      } else {
                        alert('YouTube URL을 입력해주세요.')
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>

              {/* 첨부파일 목록 */}
              {attachmentFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    첨부된 파일 ({attachmentFiles.length}) - 드래그하여 순서 변경
                  </h3>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={attachmentFiles.map(att => att.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {attachmentFiles.map(attachment => (
                        <SortableAttachmentItem key={attachment.id} attachment={attachment} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  서비스 (콤마로 구분)
                </label>
                <input
                  type="text"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  placeholder="웹 개발, 앱 개발, UI/UX 디자인"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">설정</h2>
              <FormField label="사용자 정의 URL" name="custom_url" placeholder="my-business-card" />

              <div className="flex items-center gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_primary}
                    onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">기본 명함으로 설정</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">활성화</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                삭제
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingAttachment}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                  {saving ? '저장중...' : uploadingAttachment ? '파일 업로드 중...' : '수정하기'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Theme Preview Modal */}
      <ThemePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        currentTheme={formData.theme}
        onSelectTheme={(theme) => setFormData({ ...formData, theme })}
      />

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          isOpen={!!previewFile}
          onClose={() => {
            if (previewFile?.url && !previewFile.url.startsWith('http') && !previewFile.url.includes('youtube')) {
              URL.revokeObjectURL(previewFile.url)
            }
            setPreviewFile(null)
          }}
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          fileType={previewFile.type}
        />
      )}

      {/* Address Search Modal */}
      <AddressSearchModal
        isOpen={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        onSelect={(address, latitude, longitude) => {
          setFormData({ ...formData, address })
          if (latitude && longitude) {
            setMapCoords({ latitude, longitude })
            setShowMap(true)
          }
        }}
      />
    </div>
  )
}