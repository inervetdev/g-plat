import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme, type ThemeName } from '../contexts/ThemeContext'
import ThemePreviewModal from '../components/ThemePreviewModal'

export default function CreateCardPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null)
  const [checkingUrl, setCheckingUrl] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
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
    theme: theme || 'trendy',
    custom_url: '',
    attachment_title: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // 커스텀 URL 입력 시 중복 검사
    if (name === 'custom_url' && value) {
      checkUrlAvailability(value)
    } else if (name === 'custom_url' && !value) {
      setUrlAvailable(null)
    }
  }

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
        // No rows returned = URL is available
        setUrlAvailable(true)
      } else if (data) {
        // URL is already taken
        setUrlAvailable(false)
      }
    } catch (error) {
      console.error('Error checking URL:', error)
    } finally {
      setCheckingUrl(false)
    }
  }

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.')
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
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('로그인이 필요합니다.')
        navigate('/login')
        return
      }

      // services와 skills를 배열로 변환
      const servicesArray = formData.services.split(',').map(s => s.trim()).filter(s => s)
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s)

      // Upload attachment if selected
      let attachmentData = null
      if (attachmentFile) {
        attachmentData = await uploadAttachment(attachmentFile, user.id)
        if (!attachmentData) {
          setLoading(false)
          return // Upload failed
        }
      }

      const { data, error } = await supabase
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
          attachment_title: formData.attachment_title || null,
          attachment_url: attachmentData?.url || null,
          attachment_filename: attachmentData?.filename || null,
          attachment_size: attachmentData?.size || null,
          is_primary: true // 첫 명함은 대표 명함으로
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating card:', error)
        // 더 구체적인 에러 메시지 표시
        if (error.message?.includes('duplicate key')) {
          alert('이미 사용 중인 커스텀 URL입니다. 다른 URL을 선택해주세요.')
        } else if (error.message?.includes('violates foreign key')) {
          alert('로그인이 필요합니다. 다시 로그인해주세요.')
        } else if (error.message?.includes('permission denied')) {
          alert('권한이 없습니다. 로그인 상태를 확인해주세요.')
        } else {
          alert(`명함 생성 중 오류가 발생했습니다: ${error.message}`)
        }
      } else if (data) {
        console.log('Card created successfully:', data)
        alert('명함이 성공적으로 생성되었습니다!')
        navigate('/dashboard')
      } else {
        console.error('No data returned after card creation')
        alert('명함이 생성되었지만 데이터를 가져올 수 없습니다.')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('예상치 못한 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">새 명함 만들기</h1>

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

            {/* 소셜 미디어 */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">소셜 미디어</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub
                  </label>
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      첨부파일 제목
                    </label>
                    <input
                      type="text"
                      name="attachment_title"
                      value={formData.attachment_title}
                      onChange={handleChange}
                      placeholder="예: 사업계획서, 포트폴리오"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      파일 다운로드 버튼에 표시될 이름
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      파일 업로드
                    </label>
                    <input
                      type="file"
                      onChange={handleAttachmentChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.webp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {attachmentFile && (
                      <p className="text-sm text-green-600 mt-1">
                        선택됨: {attachmentFile.name} ({(attachmentFile.size / 1024).toFixed(1)}KB)
                      </p>
                    )}
                    {uploadingAttachment && (
                      <p className="text-sm text-blue-600 mt-1">파일 업로드 중...</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      최대 10MB, PDF/DOC/PPT/XLS/이미지 파일
                    </p>
                  </div>
                </div>
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
                      <div className="absolute right-3 top-2.5 text-green-600">
                        ✓
                      </div>
                    )}
                    {!checkingUrl && urlAvailable === false && (
                      <div className="absolute right-3 top-2.5 text-red-600">
                        ✗
                      </div>
                    )}
                  </div>
                  {urlAvailable === false && (
                    <p className="mt-1 text-sm text-red-600">
                      이미 사용 중인 URL입니다. 다른 URL을 선택해주세요.
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
    </div>
  )
}