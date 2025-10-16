import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ThemePreviewModal from '../components/ThemePreviewModal'
import FilePreviewModal from '../components/FilePreviewModal'
import type { ThemeName } from '../contexts/ThemeContext'

interface AttachmentFile {
  id: string
  file?: File
  title: string
  filename: string
  file_url?: string
  file_size: number
  file_type: string
  isExisting?: boolean
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
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    department: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    github: '',
    introduction: '',
    services: '',
    skills: '',
    theme: 'trendy' as ThemeName,
    custom_url: '',
    is_primary: false,
    is_active: true
  })

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
        setFormData({
          name: card.name || '',
          title: card.title || '',
          company: card.company || '',
          department: card.department || '',
          phone: card.phone || '',
          email: card.email || '',
          website: card.website || '',
          address: card.address || '',
          linkedin: card.linkedin || '',
          instagram: card.instagram || '',
          facebook: card.facebook || '',
          twitter: card.twitter || '',
          youtube: card.youtube || '',
          github: card.github || '',
          introduction: card.introduction || '',
          services: card.services?.join(', ') || '',
          skills: card.skills?.join(', ') || '',
          theme: card.theme || 'trendy',
          custom_url: card.custom_url || '',
          is_primary: card.is_primary || false,
          is_active: card.is_active || true
        })

        // Load existing attachments
        const { data: attachments } = await supabase
          .from('card_attachments')
          .select('*')
          .eq('business_card_id', cardId)
          .order('display_order', { ascending: true })

        if (attachments) {
          const existingAttachments: AttachmentFile[] = attachments.map(att => ({
            id: att.id,
            title: att.title,
            filename: att.filename,
            file_url: att.file_url,
            file_size: att.file_size,
            file_type: att.file_type,
            isExisting: true
          }))
          setAttachmentFiles(existingAttachments)
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
      isExisting: false
    }))

    setAttachmentFiles(prev => [...prev, ...newAttachments])
    e.target.value = ''
  }

  // React Compiler가 자동으로 최적화
  const updateAttachmentTitle = (id: string, title: string) => {
    setAttachmentFiles(prev =>
      prev.map(att => att.id === id ? { ...att, title } : att)
    )
  }

  // React Compiler가 자동으로 최적화
  const removeAttachment = async (attachment: AttachmentFile) => {
    if (attachment.isExisting) {
      const { error } = await supabase
        .from('card_attachments')
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
    let url: string
    if (attachment.file) {
      url = URL.createObjectURL(attachment.file)
    } else if (attachment.file_url) {
      url = attachment.file_url
    } else {
      return
    }

    setPreviewFile({
      url,
      name: attachment.filename,
      type: attachment.file_type
    })
  }

  // React Compiler가 자동으로 최적화
  const uploadAttachments = async (files: AttachmentFile[], userId: string) => {
    const results = []

    for (const attachment of files) {
      if (!attachment.file) continue

      try {
        const fileExt = attachment.filename.split('.').pop()
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
          file_type: attachment.file_type
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
          title: formData.title,
          company: formData.company,
          department: formData.department,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          address: formData.address,
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          facebook: formData.facebook,
          twitter: formData.twitter,
          youtube: formData.youtube,
          github: formData.github,
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

      if (error) throw error

      // Upload new attachments
      const newAttachments = attachmentFiles.filter(att => !att.isExisting && att.file)
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
            display_order: attachmentFiles.filter(a => a.isExisting).length + index
          }))

          const { error: attachmentError } = await supabase
            .from('card_attachments')
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

      // Update existing attachment titles
      const existingAttachments = attachmentFiles.filter(att => att.isExisting)
      for (const att of existingAttachments) {
        await supabase
          .from('card_attachments')
          .update({ title: att.title })
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

      if (error) throw error

      alert('명함이 삭제되었습니다')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error deleting card:', error)
      alert('명함 삭제에 실패했습니다')
    }
  }

  // React Compiler가 자동으로 최적화 - 컴포넌트 추출
  const AttachmentItem = ({ attachment }: { attachment: AttachmentFile }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={attachment.title}
          onChange={(e) => updateAttachmentTitle(attachment.id, e.target.value)}
          placeholder="파일 제목"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
          {attachment.isExisting && <span className="text-green-600">✓ 저장됨</span>}
          {!attachment.isExisting && <span className="text-blue-600">새 파일</span>}
          <span>·</span>
          {attachment.filename} ({(attachment.file_size / 1024).toFixed(1)}KB)
        </p>
      </div>
      <button
        type="button"
        onClick={() => previewAttachment(attachment)}
        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
      >
        미리보기
      </button>
      <button
        type="button"
        onClick={() => removeAttachment(attachment)}
        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
      >
        삭제
      </button>
    </div>
  )

  // React Compiler가 자동으로 최적화 - 폼 필드 컴포넌트
  const FormField = ({ label, name, type = 'text', required = false, placeholder = '' }: {
    label: string
    name: keyof typeof formData
    type?: string
    required?: boolean
    placeholder?: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={formData[name]}
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  )

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
            <h1 className="text-2xl font-bold text-gray-900">명함 수정 (React Compiler 최적화)</h1>
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
                <FormField label="직책" name="title" />
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
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">소셜 미디어</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="LinkedIn" name="linkedin" />
                <FormField label="Instagram" name="instagram" />
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

              {/* 첨부파일 목록 */}
              {attachmentFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    첨부된 파일 ({attachmentFiles.length})
                  </h3>
                  {attachmentFiles.map(attachment => (
                    <AttachmentItem key={attachment.id} attachment={attachment} />
                  ))}
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
            if (previewFile?.url && !previewFile.url.startsWith('http')) {
              URL.revokeObjectURL(previewFile.url)
            }
            setPreviewFile(null)
          }}
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          fileType={previewFile.type}
        />
      )}
    </div>
  )
}