import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, Loader2, Search, UserPlus } from 'lucide-react'
import { createCard, fetchUsersForCardCreate, checkCustomUrlAvailability } from '@/lib/api/cards'
import { supabase } from '@/lib/supabase'
import type { CreateCardInput } from '@/lib/api/cards'

// Form validation schema
const cardCreateSchema = z.object({
  user_id: z.string().min(1, '사용자를 선택하세요'),
  name: z.string().min(1, '이름을 입력하세요'),
  title: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('유효한 이메일을 입력하세요').optional().or(z.literal('')),
  website: z.string().url('유효한 URL을 입력하세요').optional().or(z.literal('')),
  address: z.string().optional(),
  address_detail: z.string().optional(),
  linkedin: z.string().url('유효한 URL을 입력하세요').optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
  github: z.string().optional(),
  introduction: z.string().optional(),
  services: z.string().optional(),
  skills: z.string().optional(),
  theme: z.enum(['default', 'trendy', 'apple', 'professional', 'simple']).optional(),
  custom_url: z.string().min(3, '최소 3자 이상 입력하세요'),
  is_active: z.boolean().optional(),
})

type CardCreateFormData = z.infer<typeof cardCreateSchema>

interface CardCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface UserOption {
  id: string
  email: string
  name?: string
}

/**
 * 명함 생성 모달 컴포넌트 (관리자용)
 */
export function CardCreateModal({ isOpen, onClose, onSuccess }: CardCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ profile?: number; logo?: number }>({})

  // User search state
  const [userSearch, setUserSearch] = useState('')
  const [users, setUsers] = useState<UserOption[]>([])
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [searchingUsers, setSearchingUsers] = useState(false)

  // Custom URL check
  const [checkingUrl, setCheckingUrl] = useState(false)
  const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CardCreateFormData>({
    resolver: zodResolver(cardCreateSchema),
    defaultValues: {
      user_id: '',
      name: '',
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
      introduction: '',
      services: '',
      skills: '',
      theme: 'trendy',
      custom_url: '',
      is_active: true,
    },
  })

  const customUrl = watch('custom_url')

  // Search users when input changes
  useEffect(() => {
    const searchUsers = async () => {
      if (userSearch.length < 2) {
        setUsers([])
        return
      }

      setSearchingUsers(true)
      try {
        const results = await fetchUsersForCardCreate(userSearch)
        setUsers(results)
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setSearchingUsers(false)
      }
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [userSearch])

  // Check custom URL availability
  useEffect(() => {
    const checkUrl = async () => {
      if (!customUrl || customUrl.length < 3) {
        setUrlAvailable(null)
        return
      }

      setCheckingUrl(true)
      try {
        const available = await checkCustomUrlAvailability(customUrl)
        setUrlAvailable(available)
      } catch (error) {
        console.error('Error checking URL:', error)
      } finally {
        setCheckingUrl(false)
      }
    }

    const debounce = setTimeout(checkUrl, 500)
    return () => clearTimeout(debounce)
  }, [customUrl])

  // Handle user selection
  const handleUserSelect = (user: UserOption) => {
    setSelectedUser(user)
    setValue('user_id', user.id)
    setUserSearch(user.name || user.email || user.id)
    setShowUserDropdown(false)
  }

  // Handle profile image selection
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다')
        return
      }
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle company logo selection
  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다')
        return
      }
      setCompanyLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Upload image to Supabase Storage
  const uploadImage = async (file: File, type: 'profile' | 'logo', userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`
      const bucket = 'card-attachments'

      console.log('Uploading image:', { fileName, bucket, fileSize: file.size })

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)

      console.log('Upload success:', urlData.publicUrl)
      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Handle form submission
  const onSubmit = async (data: CardCreateFormData) => {
    if (!urlAvailable) {
      alert('커스텀 URL이 이미 사용 중입니다.')
      return
    }

    setIsSubmitting(true)
    try {
      console.log('Creating card...', data)

      // Upload images if selected
      let profileImageUrl: string | null = null
      let companyLogoUrl: string | null = null

      if (profileImage) {
        setUploadProgress({ profile: 50 })
        profileImageUrl = await uploadImage(profileImage, 'profile', data.user_id)
        setUploadProgress({ profile: 100 })
      }

      if (companyLogo) {
        setUploadProgress({ logo: 50 })
        companyLogoUrl = await uploadImage(companyLogo, 'logo', data.user_id)
        setUploadProgress({ logo: 100 })
      }

      // Parse services and skills arrays
      const servicesArray = data.services
        ? data.services.split(',').map(s => s.trim()).filter(s => s)
        : undefined
      const skillsArray = data.skills
        ? data.skills.split(',').map(s => s.trim()).filter(s => s)
        : undefined

      // Create card input
      const cardInput: CreateCardInput = {
        user_id: data.user_id,
        name: data.name,
        title: data.title || undefined,
        company: data.company || undefined,
        department: data.department || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
        address: data.address || undefined,
        address_detail: data.address_detail || undefined,
        linkedin: data.linkedin || undefined,
        instagram: data.instagram || undefined,
        facebook: data.facebook || undefined,
        twitter: data.twitter || undefined,
        youtube: data.youtube || undefined,
        github: data.github || undefined,
        introduction: data.introduction || undefined,
        services: servicesArray,
        skills: skillsArray,
        theme: data.theme || 'trendy',
        custom_url: data.custom_url,
        profile_image_url: profileImageUrl || undefined,
        company_logo_url: companyLogoUrl || undefined,
        is_active: data.is_active ?? true,
        is_primary: true,
      }

      await createCard(cardInput)

      alert('명함이 성공적으로 생성되었습니다')
      reset()
      setSelectedUser(null)
      setUserSearch('')
      setProfileImage(null)
      setCompanyLogo(null)
      setProfileImagePreview(null)
      setCompanyLogoPreview(null)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating card:', error)
      alert(`명함 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsSubmitting(false)
      setUploadProgress({})
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            새 명함 생성
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* User Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 선택</h3>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                명함 소유자 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value)
                    setShowUserDropdown(true)
                    if (!e.target.value) {
                      setSelectedUser(null)
                      setValue('user_id', '')
                    }
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  placeholder="사용자 이름 또는 이메일로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                {searchingUsers && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>

              {/* User Dropdown */}
              {showUserDropdown && users.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex flex-col"
                    >
                      <span className="font-medium text-gray-900">{user.name || '이름 없음'}</span>
                      <span className="text-sm text-gray-500">{user.email}</span>
                    </button>
                  ))}
                </div>
              )}

              {showUserDropdown && userSearch.length >= 2 && users.length === 0 && !searchingUsers && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}

              {selectedUser && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">
                    {selectedUser.name || '이름 없음'}
                  </div>
                  <div className="text-xs text-blue-600">
                    {selectedUser.email}
                  </div>
                </div>
              )}

              <input type="hidden" {...register('user_id')} />
              {errors.user_id && (
                <p className="text-sm text-red-600 mt-1">{errors.user_id.message}</p>
              )}

              <p className="text-sm text-gray-500 mt-2">
                * 새 사용자를 생성하려면 먼저 해당 사용자가 회원가입을 완료해야 합니다.
              </p>
            </div>
          </div>

          {/* Profile Images */}
          <div className="grid grid-cols-2 gap-6">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">프로필 이미지</label>
              <div className="flex flex-col items-center gap-4">
                {profileImagePreview ? (
                  <div className="relative">
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileImage(null)
                        setProfileImagePreview(null)
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">?</span>
                  </div>
                )}
                <label
                  htmlFor="profile-image-create"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>이미지 업로드</span>
                </label>
                <input
                  id="profile-image-create"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                {uploadProgress.profile !== undefined && uploadProgress.profile < 100 && (
                  <p className="text-sm text-gray-600">업로드 중... {uploadProgress.profile}%</p>
                )}
              </div>
            </div>

            {/* Company Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">회사 로고</label>
              <div className="flex flex-col items-center gap-4">
                {companyLogoPreview ? (
                  <div className="relative">
                    <img
                      src={companyLogoPreview}
                      alt="Logo preview"
                      className="w-32 h-32 rounded-lg object-contain bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCompanyLogo(null)
                        setCompanyLogoPreview(null)
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">LOGO</span>
                  </div>
                )}
                <label
                  htmlFor="company-logo-create"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>로고 업로드</span>
                </label>
                <input
                  id="company-logo-create"
                  type="file"
                  accept="image/*"
                  onChange={handleCompanyLogoChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                {uploadProgress.logo !== undefined && uploadProgress.logo < 100 && (
                  <p className="text-sm text-gray-600">업로드 중... {uploadProgress.logo}%</p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  {...register('name')}
                  placeholder="홍길동"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  직함
                </label>
                <input
                  id="title"
                  {...register('title')}
                  placeholder="대표이사"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  회사명
                </label>
                <input
                  id="company"
                  {...register('company')}
                  placeholder="주식회사 이너벳"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  부서
                </label>
                <input
                  id="department"
                  {...register('department')}
                  placeholder="경영기획실"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                  테마
                </label>
                <select
                  {...register('theme')}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="trendy">트렌디</option>
                  <option value="apple">애플</option>
                  <option value="professional">프로페셔널</option>
                  <option value="simple">심플</option>
                  <option value="default">기본</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register('is_active')}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  활성화
                </label>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">연락처 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <input
                  id="phone"
                  {...register('phone')}
                  placeholder="010-1234-5678"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@example.com"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  웹사이트
                </label>
                <input
                  id="website"
                  {...register('website')}
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.website && (
                  <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  주소
                </label>
                <input
                  id="address"
                  {...register('address')}
                  placeholder="서울시 강남구 테헤란로 123"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="address_detail" className="block text-sm font-medium text-gray-700 mb-2">
                  상세 주소
                </label>
                <input
                  id="address_detail"
                  {...register('address_detail')}
                  placeholder="A동 1층"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">소셜 링크</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  id="linkedin"
                  {...register('linkedin')}
                  placeholder="https://linkedin.com/in/username"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  id="instagram"
                  {...register('instagram')}
                  placeholder="@username"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  id="facebook"
                  {...register('facebook')}
                  placeholder="@username"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter/X
                </label>
                <input
                  id="twitter"
                  {...register('twitter')}
                  placeholder="@username"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube
                </label>
                <input
                  id="youtube"
                  {...register('youtube')}
                  placeholder="https://youtube.com/@channel"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub
                </label>
                <input
                  id="github"
                  {...register('github')}
                  placeholder="https://github.com/username"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개
                </label>
                <textarea
                  id="introduction"
                  {...register('introduction')}
                  placeholder="간단한 자기소개를 입력하세요..."
                  rows={3}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-2">
                  제공 서비스 (쉼표로 구분)
                </label>
                <input
                  id="services"
                  {...register('services')}
                  placeholder="웹 개발, 앱 개발, UI/UX 디자인"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  보유 기술 (쉼표로 구분)
                </label>
                <input
                  id="skills"
                  {...register('skills')}
                  placeholder="React, Node.js, TypeScript"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Custom URL */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">커스텀 URL</h3>
            <div>
              <label htmlFor="custom_url" className="block text-sm font-medium text-gray-700 mb-2">
                커스텀 URL <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">g-plat.com/card/</span>
                <div className="relative flex-1">
                  <input
                    id="custom_url"
                    {...register('custom_url')}
                    placeholder="my-custom-url"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      urlAvailable === false
                        ? 'border-red-500'
                        : urlAvailable === true
                        ? 'border-green-500'
                        : 'border-gray-200'
                    }`}
                  />
                  {checkingUrl && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}
                  {!checkingUrl && urlAvailable === true && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                      &#10003;
                    </span>
                  )}
                  {!checkingUrl && urlAvailable === false && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      &#10007;
                    </span>
                  )}
                </div>
              </div>
              {errors.custom_url && (
                <p className="text-sm text-red-600 mt-1">{errors.custom_url.message}</p>
              )}
              {urlAvailable === false && (
                <p className="text-sm text-red-600 mt-1">이미 사용 중인 URL입니다.</p>
              )}
              {urlAvailable === true && (
                <p className="text-sm text-green-600 mt-1">사용 가능한 URL입니다!</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedUser || urlAvailable === false}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                '명함 생성'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
