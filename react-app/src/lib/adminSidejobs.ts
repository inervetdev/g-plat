// Admin Sidejob API Functions for React App
// 제휴 부가명함 API 함수 (사용자 화면용)
// Note: Using type assertions since database types may not include new tables yet

import { supabase } from './supabase'
import type { AdminSidejobDisplayCard, AdminB2BCategory, AdminSidejobsByCategory } from '../types/adminSidejob'

// Type-safe wrapper for RPC calls to new functions
const supabaseAny = supabase as any

/**
 * Fetch admin sidejobs assigned to a user
 * Uses the get_admin_sidejobs_for_user PostgreSQL function
 */
export async function fetchAdminSidejobsForUser(userId: string): Promise<AdminSidejobDisplayCard[]> {
  try {
    const { data, error } = await supabaseAny
      .rpc('get_admin_sidejobs_for_user', { p_user_id: userId })

    if (error) {
      // Silently return empty if function doesn't exist yet
      if (error.code === '42883') {
        console.log('Admin sidejobs function not yet deployed')
        return []
      }
      console.error('Error fetching admin sidejobs:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      instance_id: row.instance_id,
      template_id: row.template_id,
      title: row.title,
      description: row.description,
      image_url: row.image_url,
      price: row.price,
      cta_text: row.cta_text,
      cta_url: row.cta_url,
      category: row.category as AdminB2BCategory,
      badge: row.badge,
      partner_name: row.partner_name,
      display_order: row.display_order || 0,
      application_enabled: row.application_enabled || false,
    }))
  } catch (error) {
    console.error('Error fetching admin sidejobs:', error)
    return []
  }
}

/**
 * Fetch admin sidejobs from the display view (alternative method)
 */
export async function fetchAdminSidejobsFromView(userId: string): Promise<AdminSidejobDisplayCard[]> {
  try {
    // Get user's subscription tier
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    const subscriptionTier = (userData as any)?.subscription_tier || 'FREE'

    // Build query based on subscription tier
    let query = supabaseAny
      .from('admin_sidejob_display')
      .select('*')
      .eq('instance_active', true)
      .eq('template_active', true)

    // Filter by assignment target
    if (subscriptionTier === 'FREE') {
      query = query.or(`user_id.eq.${userId},assignment_target.eq.all_users,assignment_target.eq.free_users`)
    } else {
      query = query.or(`user_id.eq.${userId},assignment_target.eq.all_users,assignment_target.eq.paid_users`)
    }

    query = query.order('display_priority', { ascending: false })
                 .order('display_order', { ascending: true })

    const { data, error } = await query

    if (error) {
      // Silently return empty if view doesn't exist yet
      if (error.code === '42P01') {
        console.log('Admin sidejobs view not yet deployed')
        return []
      }
      console.error('Error fetching admin sidejobs from view:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      instance_id: row.instance_id,
      template_id: row.template_id,
      title: row.title,
      description: row.description,
      image_url: row.image_url,
      price: row.price,
      cta_text: row.cta_text,
      cta_url: row.cta_url,
      category: row.category as AdminB2BCategory,
      badge: row.badge,
      partner_name: row.partner_name,
      display_order: row.display_order || 0,
      application_enabled: row.application_enabled || false,
    }))
  } catch (error) {
    console.error('Error fetching admin sidejobs from view:', error)
    return []
  }
}

/**
 * Group sidejobs by category for display
 */
export function groupSidejobsByCategory(cards: AdminSidejobDisplayCard[]): AdminSidejobsByCategory[] {
  const grouped = cards.reduce((acc, card) => {
    const category = card.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(card)
    return acc
  }, {} as Record<AdminB2BCategory, AdminSidejobDisplayCard[]>)

  // Convert to array and sort by category display order
  return Object.entries(grouped).map(([category, cards]) => ({
    category: category as AdminB2BCategory,
    cards: cards.sort((a, b) => a.display_order - b.display_order),
  }))
}

/**
 * Record a click on admin sidejob card
 */
export async function recordAdminSidejobClick(
  instanceId: string,
  businessCardId?: string,
  sourceUserId?: string
): Promise<string | null> {
  try {
    // Collect visitor info
    const userAgent = navigator.userAgent
    const referrer = document.referrer || null

    // Detect device type
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)
    const isTablet = /iPad|Tablet/i.test(userAgent)
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

    // Detect browser
    let browser = 'other'
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'

    // Detect OS
    let os = 'other'
    if (userAgent.includes('Windows')) os = 'Windows'
    else if (userAgent.includes('Mac')) os = 'macOS'
    else if (userAgent.includes('Linux')) os = 'Linux'
    else if (userAgent.includes('Android')) os = 'Android'
    else if (userAgent.includes('iOS')) os = 'iOS'

    // Get or create visitor ID from localStorage
    let visitorId = localStorage.getItem('gplat_visitor_id')
    if (!visitorId) {
      visitorId = crypto.randomUUID()
      localStorage.setItem('gplat_visitor_id', visitorId)
    }

    const { data, error } = await supabaseAny.rpc('record_admin_sidejob_click', {
      p_instance_id: instanceId,
      p_business_card_id: businessCardId || null,
      p_source_user_id: sourceUserId || null,
      p_visitor_id: visitorId,
      p_user_agent: userAgent,
      p_referrer: referrer,
      p_device_type: deviceType,
      p_browser: browser,
      p_os: os,
    })

    if (error) {
      // Silently return null if function doesn't exist yet
      if (error.code === '42883') {
        console.log('Admin sidejob click function not yet deployed')
        return null
      }
      console.error('Error recording sidejob click:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error recording sidejob click:', error)
    return null
  }
}
