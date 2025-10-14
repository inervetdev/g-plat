import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ThemePreviewModal from '../components/ThemePreviewModal'
import type { ThemeName } from '../contexts/ThemeContext'

export function EditCardPage() {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [existingAttachment, setExistingAttachment] = useState<{
    title: string
    url: string
    filename: string
  } | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    title: string
    company: string
    department: string
    phone: string
    email: string
    website: string
    address: string
    linkedin: string
    instagram: string
    facebook: string
    twitter: string
    youtube: string
    github: string
    introduction: string
    services: string
    skills: string
    theme: ThemeName
    custom_url: string
    attachment_title: string
    is_primary: boolean
    is_active: boolean
  }>({
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
    theme: 'trendy',
    custom_url: '',
    attachment_title: '',
    is_primary: false,
    is_active: true
  })

  useEffect(() => {
    loadCardData()
  }, [cardId])

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
          attachment_title: card.attachment_title || '',
          is_primary: card.is_primary || false,
          is_active: card.is_active || true
        })

        // Load existing attachment if available
        if (card.attachment_url) {
          setExistingAttachment({
            title: card.attachment_title || '첨부파일',
            url: card.attachment_url,
            filename: card.attachment_filename || '파일'
          })
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

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('파일 크기는 50MB 이하여야 합니다.')
        return
      }
      setAttachmentFile(file)
    }
  }

  const uploadAttachment = async (file: File, userId: string): Promise<{ url: string; filename: string; size: number } | null> => {
    try {
      setUploadingAttachment(true)
      console.log('📤 Starting attachment upload...', file.name)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('card-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        throw uploadError
      }

      const { data } = supabase.storage
        .from('card-attachments')
        .getPublicUrl(filePath)

      console.log('✅ Upload successful:', data.publicUrl)
      return {
        url: data.publicUrl,
        filename: file.name,
        size: file.size
      }
    } catch (error) {
      console.error('💥 Error uploading attachment:', error)
      alert(`파일 업로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      return null
    } finally {
      setUploadingAttachment(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      // Upload new attachment if selected
      let attachmentData = existingAttachment
        ? { url: existingAttachment.url, filename: existingAttachment.filename, size: 0 }
        : null

      if (attachmentFile) {
        const uploadedData = await uploadAttachment(attachmentFile, user.id)
        if (!uploadedData) {
          setSaving(false)
          return // Upload failed
        }
        attachmentData = uploadedData
      }

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
          attachment_title: formData.attachment_title || null,
          attachment_url: attachmentData?.url || null,
          attachment_filename: attachmentData?.filename || null,
          attachment_size: attachmentData?.size || null,
          is_primary: formData.is_primary,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardId)
        .eq('user_id', user.id)

      if (error) throw error

      alert('명함이 수정되었습니다!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error updating card:', error)
      alert('명함 수정에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 명함을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    직책
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    회사
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    부서
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">연락처 정보</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    웹사이트
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    주소
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">소셜 미디어</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    첨부파일 제목
                  </label>
                  <input
                    type="text"
                    value={formData.attachment_title}
                    onChange={(e) => setFormData({ ...formData, attachment_title: e.target.value })}
                    placeholder="예: 사업계획서, 포트폴리오"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    파일 다운로드 버튼에 표시될 이름
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    파일 업로드
                  </label>
                  <input
                    type="file"
                    onChange={handleAttachmentChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.webp"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {existingAttachment && !attachmentFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      현재 파일: {existingAttachment.filename}
                    </p>
                  )}
                  {attachmentFile && (
                    <p className="text-sm text-green-600 mt-1">
                      새 파일: {attachmentFile.name} ({(attachmentFile.size / 1024).toFixed(1)}KB)
                    </p>
                  )}
                  {uploadingAttachment && (
                    <p className="text-sm text-blue-600 mt-1">파일 업로드 중...</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    최대 50MB, PDF/DOC/PPT/XLS/이미지 파일
                  </p>
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  사용자 정의 URL
                </label>
                <input
                  type="text"
                  value={formData.custom_url}
                  onChange={(e) => setFormData({ ...formData, custom_url: e.target.value })}
                  placeholder="my-business-card"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

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
    </div>
  )
}