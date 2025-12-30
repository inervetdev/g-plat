import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, Loader2 } from 'lucide-react'
import { updateCard } from '@/lib/api/cards'
import { supabase } from '@/lib/supabase'
import type { CardWithStats } from '@/types/admin'

// Form validation schema
const cardEditSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  name_en: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('유효한 이메일을 입력하세요').optional().or(z.literal('')),
  website: z.string().url('유효한 URL을 입력하세요').optional().or(z.literal('')),
  address: z.string().optional(),
  address_detail: z.string().optional(),
  linkedin_url: z.string().url('유효한 URL을 입력하세요').optional().or(z.literal('')),
  twitter_url: z.string().url('유효한 URL을 입력하세요').optional().or(z.literal('')),
  facebook_url: z.string().url('유효한 URL을 입력하세요').optional().or(z.literal('')),
  instagram_url: z.string().url('유효한 URL을 입력하세요').optional().or(z.literal('')),
  youtube_url: z.string().optional(),
  github_url: z.string().optional(),
  tiktok_url: z.string().optional(),
  threads_url: z.string().optional(),
  theme: z.enum(['default', 'trendy', 'apple', 'professional', 'simple']).optional(),
  custom_url: z.string().min(3, '최소 3자 이상 입력하세요').optional(),
})

type CardEditFormData = z.infer<typeof cardEditSchema>

interface CardEditModalProps {
  card: CardWithStats
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * 명함 편집 모달 컴포넌트
 * @param card - 편집할 명함 데이터
 * @param isOpen - 모달 열림 상태
 * @param onClose - 모달 닫기 핸들러
 * @param onSuccess - 저장 성공 핸들러
 */
export function CardEditModal({ card, isOpen, onClose, onSuccess }: CardEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    card.profile_image_url || null
  )
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(
    card.company_logo_url || null
  )
  const [uploadProgress, setUploadProgress] = useState<{
    profile?: number
    logo?: number
  }>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardEditFormData>({
    resolver: zodResolver(cardEditSchema),
    defaultValues: {
      name: card.name,
      name_en: (card as any).name_en || '',
      title: card.title || '',
      company: card.company || '',
      department: card.department || '',
      phone: card.phone || '',
      email: card.email || '',
      website: card.website || '',
      address: card.address || '',
      address_detail: card.address_detail || '',
      linkedin_url: card.linkedin || '',
      twitter_url: card.twitter || '',
      facebook_url: card.facebook || '',
      instagram_url: card.instagram || '',
      youtube_url: (card as any).youtube || '',
      github_url: (card as any).github || '',
      tiktok_url: (card as any).tiktok || '',
      threads_url: (card as any).threads || '',
      theme: (card.theme as any) || 'default',
      custom_url: card.custom_url || '',
    },
  })

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
  const uploadImage = async (file: File, type: 'profile' | 'logo'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${card.user_id}/${type}-${Date.now()}.${fileExt}`
      const bucket = 'card-attachments'

      console.log('📤 Uploading image:', { fileName, bucket, fileSize: file.size })

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        throw uploadError
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)

      console.log('✅ Upload success:', urlData.publicUrl)
      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Handle form submission
  const onSubmit = async (data: CardEditFormData) => {
    setIsSubmitting(true)
    try {
      console.log('🔍 Submitting card update...', { cardId: card.id, userId: card.user_id })

      // Upload images if selected
      let profileImageUrl: string | null | undefined = card.profile_image_url
      let companyLogoUrl: string | null | undefined = card.company_logo_url

      if (profileImage) {
        console.log('📤 Uploading profile image...')
        setUploadProgress({ profile: 50 })
        profileImageUrl = await uploadImage(profileImage, 'profile')
        setUploadProgress({ profile: 100 })
      }

      if (companyLogo) {
        console.log('📤 Uploading company logo...')
        setUploadProgress({ logo: 50 })
        companyLogoUrl = await uploadImage(companyLogo, 'logo')
        setUploadProgress({ logo: 100 })
      }

      // Transform form data to match database schema
      const updateData: any = {
        name: data.name,
        name_en: data.name_en || null,
        title: data.title || null,
        company: data.company || null,
        department: data.department || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        address: data.address || null,
        address_detail: data.address_detail || null,
        linkedin: data.linkedin_url || null,
        twitter: data.twitter_url || null,
        facebook: data.facebook_url || null,
        instagram: data.instagram_url || null,
        youtube: data.youtube_url || null,
        github: data.github_url || null,
        tiktok: data.tiktok_url || null,
        threads: data.threads_url || null,
        theme: data.theme || null,
        custom_url: data.custom_url || null,
        profile_image_url: profileImageUrl,
        company_logo_url: companyLogoUrl,
        updated_at: new Date().toISOString()
      }

      console.log('📝 Update data:', updateData)

      // Update card with images
      await updateCard(card.id, updateData)

      alert('명함이 성공적으로 수정되었습니다')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('❌ Error updating card:', error)
      alert(`명함 수정에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsSubmitting(false)
      setUploadProgress({})
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">명함 편집</h2>
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
          {/* Profile Images */}
          <div className="grid grid-cols-2 gap-6">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">프로필 이미지</label>
              <div className="flex flex-col items-center gap-4">
                {profileImagePreview && (
                  <img
                    src={profileImagePreview}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                )}
                <label
                  htmlFor="profile-image"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>이미지 업로드</span>
                </label>
                <input
                  id="profile-image"
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
                {companyLogoPreview && (
                  <img
                    src={companyLogoPreview}
                    alt="Logo preview"
                    className="w-32 h-32 rounded-lg object-contain bg-gray-50"
                  />
                )}
                <label
                  htmlFor="company-logo"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>로고 업로드</span>
                </label>
                <input
                  id="company-logo"
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
                <label htmlFor="name_en" className="block text-sm font-medium text-gray-700 mb-2">
                  영문 이름
                </label>
                <input
                  id="name_en"
                  {...register('name_en')}
                  placeholder="Gil-dong Hong"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  <option value="default">기본</option>
                  <option value="trendy">트렌디</option>
                  <option value="apple">애플</option>
                  <option value="professional">프로페셔널</option>
                  <option value="simple">심플</option>
                </select>
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
            <div className="space-y-4">
              <div>
                <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  id="linkedin_url"
                  {...register('linkedin_url')}
                  placeholder="https://linkedin.com/in/username"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  id="twitter_url"
                  {...register('twitter_url')}
                  placeholder="https://twitter.com/username"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  id="facebook_url"
                  {...register('facebook_url')}
                  placeholder="https://facebook.com/username"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  id="instagram_url"
                  {...register('instagram_url')}
                  placeholder="https://instagram.com/username"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube
                </label>
                <input
                  id="youtube_url"
                  {...register('youtube_url')}
                  placeholder="https://youtube.com/@channel"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub
                </label>
                <input
                  id="github_url"
                  {...register('github_url')}
                  placeholder="https://github.com/username"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="tiktok_url" className="block text-sm font-medium text-gray-700 mb-2">
                  TikTok
                </label>
                <input
                  id="tiktok_url"
                  {...register('tiktok_url')}
                  placeholder="@username"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="threads_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Threads
                </label>
                <input
                  id="threads_url"
                  {...register('threads_url')}
                  placeholder="@username"
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
                커스텀 URL
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">g-plat.com/card/</span>
                <input
                  id="custom_url"
                  {...register('custom_url')}
                  placeholder="my-custom-url"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errors.custom_url && (
                <p className="text-sm text-red-600 mt-1">{errors.custom_url.message}</p>
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
