import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CardWithSideJobs from '../components/CardWithSideJobs'

export default function CardViewPage() {
  const { userId } = useParams<{ userId: string }>()
  const [loading, setLoading] = useState(true)
  const [userExists, setUserExists] = useState(false)
  const [businessCard, setBusinessCard] = useState<any>(null)
  const [sideJobCards, setSideJobCards] = useState<any[]>([])

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
        page_url: `/card/${userId}`,
        visitor_ip: null, // 서버사이드에서 처리하는 것이 더 안전
        user_agent: navigator.userAgent,
        referrer: document.referrer || null
      }

      // Insert visitor stats, ignore errors (409 Conflict is expected for duplicates)
      const { error } = await supabase
        .from('visitor_stats')
        .insert(visitorData)

      // Silently ignore 409 conflicts (duplicate entries)
      if (error && error.code !== '23505') {
        console.error('Error recording visitor stats:', error)
      }
    } catch (error) {
      // Silently fail - visitor stats are not critical
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
        .maybeSingle()

      if (cardByUrl && !urlError) {
        setUserExists(true)
        setBusinessCard(cardByUrl)

        // 부가명함 로드
        const { data: sideJobs } = await supabase
          .from('sidejob_cards')
          .select('*')
          .eq('is_active', true)
          .or(`business_card_id.is.null,business_card_id.eq.${cardByUrl.id}`)
          .eq('user_id', cardByUrl.user_id)
          .order('display_order', { ascending: true })

        if (sideJobs) {
          setSideJobCards(sideJobs)
        }

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
        .maybeSingle()

      if (cardById && !idError) {
        setUserExists(true)
        setBusinessCard(cardById)

        // 부가명함 로드
        const { data: sideJobs } = await supabase
          .from('sidejob_cards')
          .select('*')
          .eq('is_active', true)
          .or(`business_card_id.is.null,business_card_id.eq.${cardById.id}`)
          .eq('user_id', cardById.user_id)
          .order('display_order', { ascending: true })

        if (sideJobs) {
          setSideJobCards(sideJobs)
        }

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
        .maybeSingle()

      if (primaryCard && !primaryError) {
        setUserExists(true)
        setBusinessCard(primaryCard)

        // 부가명함 로드
        const { data: sideJobs } = await supabase
          .from('sidejob_cards')
          .select('*')
          .eq('is_active', true)
          .or(`business_card_id.is.null,business_card_id.eq.${primaryCard.id}`)
          .eq('user_id', primaryCard.user_id)
          .order('display_order', { ascending: true })

        if (sideJobs) {
          setSideJobCards(sideJobs)
        }

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
        .maybeSingle()

      if (anyCard && !anyError) {
        setUserExists(true)
        setBusinessCard(anyCard)

        // 부가명함 로드
        const { data: sideJobs } = await supabase
          .from('sidejob_cards')
          .select('*')
          .eq('is_active', true)
          .or(`business_card_id.is.null,business_card_id.eq.${anyCard.id}`)
          .eq('user_id', anyCard.user_id)
          .order('display_order', { ascending: true })

        if (sideJobs) {
          setSideJobCards(sideJobs)
        }

        setLoading(false)
        return
      }

      // If no business card found, check if user exists and load their profile theme
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (userData && !userError) {
        setUserExists(true)
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

  // Render the business card with sidejob cards
  if (businessCard) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <CardWithSideJobs
          businessCard={businessCard}
          sideJobCards={sideJobCards}
        />
      </div>
    )
  }

  // No business card found
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