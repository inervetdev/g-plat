import React from 'react'
import { SimpleCard } from './themes/SimpleCard'
import { ProfessionalCard } from './themes/ProfessionalCard'
import { TrendyCard } from './themes/TrendyCard'
import { AppleCard } from './themes/AppleCard'
import { DefaultCard } from './themes/DefaultCard'

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
}

interface SideJobCard {
  id: string
  title: string
  description: string | null
  image_url: string | null
  price: string | null
  cta_text: string | null
  cta_url: string | null
  is_active: boolean
}

interface CardWithSideJobsProps {
  businessCard: BusinessCard
  sideJobCards: SideJobCard[]
}

export default function CardWithSideJobs({ businessCard, sideJobCards }: CardWithSideJobsProps) {
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
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  {/* 이미지 */}
                  {sideJob.image_url && (
                    <div className="w-24 h-24 flex-shrink-0">
                      {sideJob.cta_url ? (
                        <a
                          href={sideJob.cta_url}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {sideJob.title}
                    </h3>
                    {sideJob.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {sideJob.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {sideJob.price && (
                        <span className="text-sm font-medium text-gray-900">
                          {sideJob.price}
                        </span>
                      )}
                      {sideJob.cta_text && sideJob.cta_url && (
                        <a
                          href={sideJob.cta_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
    </div>
  )
}
