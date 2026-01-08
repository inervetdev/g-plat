import { useState } from 'react'
import { Flag } from 'lucide-react'
import { SimpleCard } from './themes/SimpleCard'
import { ProfessionalCard } from './themes/ProfessionalCard'
import { TrendyCard } from './themes/TrendyCard'
import { AppleCard } from './themes/AppleCard'
import { DefaultCard } from './themes/DefaultCard'
import AdminSidejobCards from './AdminSidejobCards'
import { ReportModal } from './report/ReportModal'
import type { CategoryPrimary } from '../types/sidejob'
import { CATEGORY_CONFIG, isCardExpired, isCardExpiringSoon } from '../types/sidejob'

interface BusinessCard {
  id: string
  user_id: string
  name: string
  title: string | null
  company: string | null
  phone: string | null
  email: string | null
  website: string | null
  linkedin: string | null
  instagram: string | null
  facebook: string | null
  twitter: string | null
  introduction: string | null
  theme: string
  profile_image: string | null
  company_logo: string | null
  custom_url: string | null
}

interface SideJobCard {
  id: string
  title: string
  description: string | null
  image_url: string | null
  price: string | null
  cta_text: string | null
  cta_link: string | null
  category_primary: CategoryPrimary | null
  category_secondary: string | null
  badge: string | null
  expiry_date: string | null
  is_active: boolean
}

interface CardWithSideJobsProps {
  businessCard: BusinessCard
  sideJobCards: SideJobCard[]
}

export default function CardWithSideJobs({ businessCard, sideJobCards }: CardWithSideJobsProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  const renderBusinessCard = () => {
    const theme = businessCard.theme || 'default'
    const userId = businessCard.id // business card id를 userId로 사용

    switch (theme) {
      case 'simple':
        return <SimpleCard userId={userId} />
      case 'professional':
        return <ProfessionalCard userId={userId} />
      case 'trendy':
        return <TrendyCard userId={userId} />
      case 'apple':
        return <AppleCard userId={userId} />
      default:
        return <DefaultCard userId={userId} />
    }
  }

  const activeSideJobs = sideJobCards.filter(card => card.is_active)

  return (
    <div className="space-y-0">
      {/* 메인 명함 */}
      <div className="max-w-md mx-auto">
        {renderBusinessCard()}
      </div>

      {/* 부가명함들 - 명함 아래에 붙음 */}
      {activeSideJobs.length > 0 && (
        <div className="max-w-md mx-auto bg-white">
          {activeSideJobs.map((sideJob, index) => (
            <div
              key={sideJob.id}
              className={`border-t border-gray-200 ${
                index === activeSideJobs.length - 1 ? 'rounded-b-2xl' : ''
              }`}
            >
              <div className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                {/* Badge and Expiry Notice */}
                {(sideJob.badge || (sideJob.expiry_date && !isCardExpired(sideJob.expiry_date))) && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    {sideJob.badge && (
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-red-500 text-white">
                        {sideJob.badge}
                      </span>
                    )}
                    {sideJob.expiry_date && !isCardExpired(sideJob.expiry_date) && isCardExpiringSoon(sideJob.expiry_date) && (
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-orange-500 text-white">
                        ⏰ {new Date(sideJob.expiry_date).toLocaleDateString()}까지
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-3 sm:gap-4">
                  {/* 이미지 */}
                  {sideJob.image_url && (
                    <div className="w-20 sm:w-24 h-20 sm:h-24 flex-shrink-0">
                      {sideJob.cta_link ? (
                        <a
                          href={sideJob.cta_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-full"
                        >
                          <img
                            src={sideJob.image_url}
                            alt={sideJob.title}
                            className="w-full h-full object-cover rounded-lg hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ) : (
                        <img
                          src={sideJob.image_url}
                          alt={sideJob.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1.5 sm:gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate flex-1">
                        {sideJob.title}
                      </h3>
                      {/* Category Badge */}
                      {sideJob.category_primary && (
                        <span
                          className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium text-white flex-shrink-0 max-w-[70px] sm:max-w-[80px] truncate"
                          style={{ backgroundColor: CATEGORY_CONFIG[sideJob.category_primary].color }}
                          title={`${CATEGORY_CONFIG[sideJob.category_primary].label}${sideJob.category_secondary ? ` · ${sideJob.category_secondary}` : ''}`}
                        >
                          {sideJob.category_secondary || CATEGORY_CONFIG[sideJob.category_primary].label.replace(/^.+\s/, '')}
                        </span>
                      )}
                    </div>
                    {sideJob.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 line-clamp-2">
                        {sideJob.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                      {sideJob.price && (
                        <span className="text-xs sm:text-sm font-medium text-gray-900 truncate flex-1">
                          {sideJob.price}
                        </span>
                      )}
                      {sideJob.cta_text && sideJob.cta_link && (
                        <a
                          href={sideJob.cta_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center min-h-[36px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                        >
                          {sideJob.cta_text}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 제휴 부가명함 - 관리자가 할당한 제휴 카드 */}
      <div className="max-w-md mx-auto">
        <AdminSidejobCards
          userId={businessCard.user_id}
          businessCardId={businessCard.id}
          cardUrl={businessCard.custom_url || businessCard.id}
          className={activeSideJobs.length > 0 ? '' : 'rounded-b-2xl overflow-hidden'}
        />
      </div>

      {/* 신고 버튼 */}
      <div className="max-w-md mx-auto mt-4 text-center">
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Flag className="w-3 h-3" />
          부적절한 콘텐츠 신고
        </button>
      </div>

      {/* 신고 모달 */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="business_card"
        targetId={businessCard.id}
        targetOwnerId={businessCard.user_id}
        targetName={businessCard.name || businessCard.company || '명함'}
      />
    </div>
  )
}
