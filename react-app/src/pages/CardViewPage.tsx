import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'
import { TrendyCard } from '../components/themes/TrendyCard'
import { AppleCard } from '../components/themes/AppleCard'
import { ProfessionalCard } from '../components/themes/ProfessionalCard'
import { SimpleCard } from '../components/themes/SimpleCard'
import { DefaultCard } from '../components/themes/DefaultCard'

export default function CardViewPage() {
  const { userId } = useParams<{ userId: string }>()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [userExists, setUserExists] = useState(false)
  const [cardTheme, setCardTheme] = useState(theme)
  const [cardId, setCardId] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      checkUserAndLoadCard()
    }
  }, [userId])

  const recordVisitorStats = async (cardUserId: string) => {
    try {
      // 방문자 정보 수집
      const visitorData = {
        user_id: cardUserId,
        page_visited: `/card/${userId}`,
        visitor_ip: null, // 서버사이드에서 처리하는 것이 더 안전
        user_agent: navigator.userAgent,
        referrer: document.referrer || null
      }

      await supabase
        .from('visitor_stats')
        .insert(visitorData)
    } catch (error) {
      console.error('Error recording visitor stats:', error)
    }
  }

  const checkUserAndLoadCard = async () => {
    try {
      // First check if this is a card ID or user ID
      // Try to find business card by custom_url or card ID
      const { data: cardByUrl, error: urlError } = await supabase
        .from('business_cards')
        .select('*')
        .eq('custom_url', userId)
        .eq('is_active', true)
        .single()

      if (cardByUrl && !urlError) {
        setUserExists(true)
        setCardTheme(cardByUrl.theme || 'trendy')
        setCardId(cardByUrl.id)

        // 방문 통계 기록
        await recordVisitorStats(cardByUrl.user_id)

        // 조회수 증가
        await supabase
          .from('business_cards')
          .update({ view_count: (cardByUrl.view_count || 0) + 1 })
          .eq('id', cardByUrl.id)

        setLoading(false)
        return
      }

      // Try to find business card by card ID
      const { data: cardById, error: idError } = await supabase
        .from('business_cards')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single()

      if (cardById && !idError) {
        setUserExists(true)
        setCardTheme(cardById.theme || 'trendy')
        setCardId(cardById.id)

        // 방문 통계 기록
        await recordVisitorStats(cardById.user_id)

        // 조회수 증가
        await supabase
          .from('business_cards')
          .update({ view_count: (cardById.view_count || 0) + 1 })
          .eq('id', cardById.id)

        setLoading(false)
        return
      }

      // Try to find primary business card by user ID
      const { data: primaryCard, error: primaryError } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .eq('is_active', true)
        .single()

      if (primaryCard && !primaryError) {
        setUserExists(true)
        setCardTheme(primaryCard.theme || 'trendy')
        setCardId(primaryCard.id)
        setLoading(false)
        return
      }

      // Try to find any active business card by user ID
      const { data: anyCard, error: anyError } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (anyCard && !anyError) {
        setUserExists(true)
        setCardTheme(anyCard.theme || 'trendy')
        setCardId(anyCard.id)
        setLoading(false)
        return
      }

      // If no business card found, check if user exists and load their profile theme
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (userData && !userError) {
        setUserExists(true)

        // Load user's profile theme as fallback
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('theme')
          .eq('user_id', userId)
          .single()

        if (profileData?.theme) {
          setCardTheme(profileData.theme)
        }
      } else {
        setUserExists(false)
      }
    } catch (error) {
      console.error('Error loading card:', error)
      setUserExists(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-600">명함을 불러오는 중...</div>
      </div>
    )
  }

  if (!userExists || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">명함을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 명함이 존재하지 않거나 삭제되었습니다.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    )
  }

  // Render the appropriate theme component based on card's theme
  const cardIdOrUserId = cardId || userId

  switch (cardTheme) {
    case 'apple':
      return <AppleCard userId={cardIdOrUserId} />
    case 'professional':
      return <ProfessionalCard userId={cardIdOrUserId} />
    case 'simple':
      return <SimpleCard userId={cardIdOrUserId} />
    case 'default':
      return <DefaultCard userId={cardIdOrUserId} />
    case 'trendy':
    default:
      return <TrendyCard userId={cardIdOrUserId} />
  }
}