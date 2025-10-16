import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme, type ThemeName } from '../contexts/ThemeContext'
import ThemePreviewModal from '../components/ThemePreviewModal'
import FilePreviewModal from '../components/FilePreviewModal'

interface AttachmentFile {
  id: string
  file?: File
  title: string
  preview?: string
  youtube_url?: string
  youtube_display_mode?: 'modal' | 'inline'
  attachment_type: 'file' | 'youtube'
}

// React Compiler가 자동으로 최적화 - 수동 memo, useCallback, useMemo 불필요!
export default function CreateCardPageOptimized() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null)
  const [checkingUrl, setCheckingUrl] = useState(false)
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
    theme: theme || 'trendy' as ThemeName,
    custom_url: ''
  })

  // React Compiler가 자동으로 최적화
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'custom_url' && value) {
      checkUrlAvailability(value)
    } else if (name === 'custom_url' && !value) {
      setUrlAvailable(null)
    }
  }

  // React Compiler가 자동으로 최적화
  const checkUrlAvailability = async (url: string) => {
    setCheckingUrl(true)
    setUrlAvailable(null)

    try {
      const { data, error } = await supabase
        .from('business_cards')
        .select('id')
        .eq('custom_url', url)
        .single()

      if (error && error.code === 'PGRST116') {
        setUrlAvailable(true)
      } else if (data) {
        setUrlAvailable(false)
      }
    } catch (error) {
      console.error('Error checking URL:', error)
    } finally {
      setCheckingUrl(false)
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
      id: `${Date.now()}-${Math.random()}`,
      file,
      title: file.name.split('.').slice(0, -1).join('.'),
      attachment_type: 'file' as const
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
      attachment_type: 'youtube'
    }
    setAttachmentFiles(prev => [...prev, newAttachment])
  }

  // React Compiler가 자동으로 최적화
  const updateAttachmentTitle = (id: string, title: string) => {
    setAttachmentFiles(prev =>
      prev.map(att => att.id === id ? { ...att, title } : att)
    )
  }

  // React Compiler가 자동으로 최적화
  const updateYouTubeDisplayMode = (id: string, mode: 'modal' | 'inline') => {
    setAttachmentFiles(prev =>
      prev.map(att => att.id === id ? { ...att, youtube_display_mode: mode } : att)
    )
  }

  // React Compiler가 자동으로 최적화
  const removeAttachment = (id: string) => {
    setAttachmentFiles(prev => prev.filter(att => att.id !== id))
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
        name: attachment.file.name,
        type: attachment.file.type
      })
    }
  }

  // React Compiler가 자동으로 최적화
  const uploadAttachments = async (files: AttachmentFile[], userId: string) => {
    const results = []

    for (let i = 0; i < files.length; i++) {
      const attachment = files[i]

      if (attachment.attachment_type === 'youtube' && attachment.youtube_url) {
        results.push({
          title: attachment.title,
          youtube_url: attachment.youtube_url,
          youtube_display_mode: attachment.youtube_display_mode || 'modal',
          attachment_type: 'youtube',
          display_order: i
        })
        continue
      }

      if (!attachment.file) continue

      try {
        console.log(`📤 Uploading ${i + 1}/${files.length}: ${attachment.file.name}`)

        const fileExt = attachment.file.name.split('.').pop()
        const fileName = `${Date.now()}-${i}.${fileExt}`
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
          title: attachment.title,
          filename: attachment.file.name,
          file_url: data.publicUrl,
          file_size: attachment.file.size,
          file_type: attachment.file.type,
          attachment_type: 'file',
          display_order: i
        })

        console.log(`✅ Upload successful: ${attachment.file.name}`)
      } catch (error) {
        console.error(`❌ Upload failed: ${attachment.file.name}`, error)
        throw error
      }
    }

    return results
  }

  // React Compiler가 자동으로 최적화
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('로그인이 필요합니다.')
        navigate('/login')
        return
      }

      const servicesArray = formData.services.split(',').map(s => s.trim()).filter(s => s)
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s)

      const { data: cardData, error: cardError } = await supabase
        .from('business_cards')
        .insert({
          user_id: user.id,
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
          services: servicesArray,
          skills: skillsArray,
          theme: formData.theme,
          custom_url: formData.custom_url || null,
          is_primary: true
        })
        .select()
        .single()

      if (cardError) {
        console.error('Error creating card:', cardError)
        if (cardError.message?.includes('duplicate key')) {
          alert('이미 사용 중인 커스텀 URL입니다. 다른 URL을 선택해주세요.')
        } else if (cardError.message?.includes('violates foreign key')) {
          alert('로그인이 필요합니다. 다시 로그인해주세요.')
        } else if (cardError.message?.includes('permission denied')) {
          alert('권한이 없습니다. 로그인 상태를 확인해주세요.')
        } else {
          alert(`명함 생성 중 오류가 발생했습니다: ${cardError.message}`)
        }
        return
      }

      if (attachmentFiles.length > 0 && cardData) {
        setUploadingAttachment(true)
        try {
          const uploadedFiles = await uploadAttachments(attachmentFiles, user.id)
          console.log('Uploaded files:', uploadedFiles)
          alert('첨부파일이 업로드되었습니다. (DB 저장 기능은 준비 중)')
        } catch (error) {
          console.error('Error uploading attachments:', error)
          alert('첨부파일 업로드 중 오류가 발생했습니다.')
        } finally {
          setUploadingAttachment(false)
        }
      }

      console.log('Card created successfully:', cardData)
      alert('명함이 성공적으로 생성되었습니다!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('예상치 못한 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // React Compiler가 자동으로 최적화 - 컴포넌트 추출
  const AttachmentItem = ({ attachment }: { attachment: AttachmentFile }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
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
                <option value="modal">미리보기 버튼</option>
                <option value="inline">화면에 직접 표시</option>
              </select>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">
          {attachment.attachment_type === 'youtube'
            ? attachment.youtube_url
            : `${attachment.file?.name} (${((attachment.file?.size || 0) / 1024).toFixed(1)}KB)`
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
        onClick={() => removeAttachment(attachment.id)}
        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors whitespace-nowrap"
      >
        삭제
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">새 명함 만들기 (React Compiler 최적화)</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    직책
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    회사
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    부서
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 연락처 정보 */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">연락처</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    웹사이트
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 소셜 미디어 - 간소화 */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">소셜 미디어</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['linkedin', 'instagram', 'github', 'twitter'].map(social => (
                  <div key={social}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {social}
                    </label>
                    <input
                      type={social === 'linkedin' ? 'url' : 'text'}
                      name={social}
                      value={formData[social as keyof typeof formData]}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">추가 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    자기소개
                  </label>
                  <textarea
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                            const displayMode = confirm('명함 화면에 영상을 직접 표시하시겠습니까?')
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
                      첨부된 파일 ({attachmentFiles.length})
                    </h3>
                    {attachmentFiles.map(attachment => (
                      <AttachmentItem key={attachment.id} attachment={attachment} />
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제공 서비스 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    name="services"
                    value={formData.services}
                    onChange={handleChange}
                    placeholder="웹 개발, 앱 개발, UI/UX 디자인"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    보유 기술 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, TypeScript"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 디자인 설정 */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">디자인 설정</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    테마
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="theme"
                      value={formData.theme}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="trendy">트렌디</option>
                      <option value="apple">애플</option>
                      <option value="professional">프로페셔널</option>
                      <option value="simple">심플</option>
                      <option value="default">기본</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      미리보기
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    커스텀 URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="custom_url"
                      value={formData.custom_url}
                      onChange={handleChange}
                      placeholder="john-doe"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        urlAvailable === false ? 'border-red-500' :
                        urlAvailable === true ? 'border-green-500' : 'border-gray-300'
                      }`}
                    />
                    {checkingUrl && (
                      <div className="absolute right-3 top-2.5 text-gray-500">
                        <span className="text-sm">확인 중...</span>
                      </div>
                    )}
                    {!checkingUrl && urlAvailable === true && (
                      <div className="absolute right-3 top-2.5 text-green-600">✓</div>
                    )}
                    {!checkingUrl && urlAvailable === false && (
                      <div className="absolute right-3 top-2.5 text-red-600">✗</div>
                    )}
                  </div>
                  {urlAvailable === false && (
                    <p className="mt-1 text-sm text-red-600">
                      이미 사용 중인 URL입니다.
                    </p>
                  )}
                  {urlAvailable === true && (
                    <p className="mt-1 text-sm text-green-600">
                      사용 가능한 URL입니다!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || uploadingAttachment || (formData.custom_url && urlAvailable === false) || checkingUrl}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '생성 중...' : uploadingAttachment ? '파일 업로드 중...' : '명함 만들기'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Theme Preview Modal */}
      <ThemePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        currentTheme={formData.theme}
        onSelectTheme={(theme: ThemeName) => setFormData(prev => ({ ...prev, theme }))}
      />

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          isOpen={!!previewFile}
          onClose={() => {
            if (previewFile?.url && !previewFile.url.includes('youtube')) {
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