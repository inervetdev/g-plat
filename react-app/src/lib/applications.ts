// Product Application API Functions for React App
// 상품 신청 API 함수 (사용자 화면용)

import { supabase } from './supabase'
import type {
  ApplicationTemplate,
  ApplicationSubmitData,
  ApplicationResult,
  MyApplication,
  ReferredApplication,
  FormFieldSchema,
} from '../types/application'

// Type-safe wrapper for new table queries
const supabaseAny = supabase as any

/**
 * Detect device type from user agent
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const userAgent = navigator.userAgent
  const isMobile = /Mobile|Android|iPhone|iPod/i.test(userAgent)
  const isTablet = /iPad|Tablet/i.test(userAgent)
  return isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'
}

/**
 * Fetch template for application form
 * 신청 폼을 위한 템플릿 정보 조회
 */
export async function fetchTemplateForApplication(templateId: string): Promise<ApplicationTemplate | null> {
  try {
    const { data, error } = await supabaseAny
      .from('admin_sidejob_templates')
      .select(`
        id,
        title,
        description,
        image_url,
        price,
        partner_name,
        category,
        form_schema,
        application_enabled,
        application_settings,
        is_active
      `)
      .eq('id', templateId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching template:', error)
      return null
    }

    if (!data) return null

    // Check if application is enabled
    if (!data.application_enabled) {
      console.log('Application not enabled for this template')
      return null
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      image_url: data.image_url,
      price: data.price,
      partner_name: data.partner_name,
      category: data.category,
      form_schema: (data.form_schema || []) as FormFieldSchema[],
      application_enabled: data.application_enabled,
      application_settings: data.application_settings || {},
    }
  } catch (error) {
    console.error('Error fetching template:', error)
    return null
  }
}

/**
 * Find business card by custom URL
 * 추천인 명함 URL로 명함 정보 조회
 */
export async function findBusinessCardByUrl(customUrl: string): Promise<{
  id: string
  user_id: string
} | null> {
  try {
    const { data, error } = await supabase
      .from('business_cards')
      .select('id, user_id')
      .eq('custom_url', customUrl)
      .single()

    if (error) {
      console.error('Error finding business card:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error finding business card:', error)
    return null
  }
}

/**
 * Check for duplicate application
 * 중복 신청 확인
 */
export async function checkDuplicateApplication(
  templateId: string,
  email: string,
  daysToCheck: number = 30
): Promise<boolean> {
  try {
    const checkDate = new Date()
    checkDate.setDate(checkDate.getDate() - daysToCheck)

    const { data, error } = await supabaseAny
      .from('product_applications')
      .select('id')
      .eq('template_id', templateId)
      .eq('applicant_email', email)
      .gte('created_at', checkDate.toISOString())
      .limit(1)

    if (error) {
      console.error('Error checking duplicate:', error)
      return false
    }

    return (data && data.length > 0) || false
  } catch (error) {
    console.error('Error checking duplicate:', error)
    return false
  }
}

/**
 * Submit product application
 * 상품 신청 제출
 */
export async function submitApplication(
  data: ApplicationSubmitData
): Promise<ApplicationResult> {
  try {
    // Get referrer info if referrer URL provided
    let referrerUserId: string | null = null
    let referrerCardId: string | null = null

    if (data.referrer_card_url) {
      const cardInfo = await findBusinessCardByUrl(data.referrer_card_url)
      if (cardInfo) {
        referrerUserId = cardInfo.user_id
        referrerCardId = cardInfo.id
      }
    }

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Insert application
    const { data: result, error } = await supabaseAny
      .from('product_applications')
      .insert({
        template_id: data.template_id,
        instance_id: data.instance_id || null,
        referrer_user_id: referrerUserId,
        referrer_card_id: referrerCardId,
        referrer_card_url: data.referrer_card_url || null,
        applicant_user_id: user?.id || null,
        applicant_name: data.applicant_name,
        applicant_phone: data.applicant_phone,
        applicant_email: data.applicant_email,
        form_data: data.form_data,
        privacy_agreed: data.privacy_agreed,
        privacy_agreed_at: data.privacy_agreed ? new Date().toISOString() : null,
        device_type: data.device_type || getDeviceType(),
        user_agent: navigator.userAgent,
        status: 'pending',
      })
      .select('id, status, created_at')
      .single()

    if (error) {
      console.error('Error submitting application:', error)
      return {
        id: '',
        status: 'pending',
        created_at: '',
        message: '신청 중 오류가 발생했습니다. 다시 시도해주세요.',
      }
    }

    return {
      id: result.id,
      status: result.status,
      created_at: result.created_at,
      message: '신청이 완료되었습니다.',
    }
  } catch (error) {
    console.error('Error submitting application:', error)
    return {
      id: '',
      status: 'pending',
      created_at: '',
      message: '신청 중 오류가 발생했습니다.',
    }
  }
}

/**
 * Fetch my applications (for logged-in user)
 * 내 신청 목록 조회
 */
export async function fetchMyApplications(): Promise<MyApplication[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabaseAny
      .from('product_applications')
      .select(`
        id,
        template_id,
        status,
        created_at,
        updated_at,
        admin_sidejob_templates (
          title,
          image_url
        )
      `)
      .eq('applicant_user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching my applications:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      template_id: row.template_id,
      template_title: row.admin_sidejob_templates?.title || '알 수 없음',
      template_image_url: row.admin_sidejob_templates?.image_url || null,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  } catch (error) {
    console.error('Error fetching my applications:', error)
    return []
  }
}

/**
 * Fetch referred applications (for card owner)
 * 추천인 신청 목록 조회 (명함 소유자용)
 */
export async function fetchReferredApplications(): Promise<ReferredApplication[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabaseAny
      .from('product_applications')
      .select(`
        id,
        template_id,
        applicant_name,
        status,
        referrer_reward_type,
        referrer_reward_amount,
        referrer_reward_status,
        created_at,
        admin_sidejob_templates (
          title
        )
      `)
      .eq('referrer_user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching referred applications:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      template_id: row.template_id,
      template_title: row.admin_sidejob_templates?.title || '알 수 없음',
      applicant_name: row.applicant_name,
      status: row.status,
      referrer_reward_type: row.referrer_reward_type,
      referrer_reward_amount: row.referrer_reward_amount || 0,
      referrer_reward_status: row.referrer_reward_status,
      created_at: row.created_at,
    }))
  } catch (error) {
    console.error('Error fetching referred applications:', error)
    return []
  }
}

/**
 * Get application statistics for referrer
 * 추천인 신청 통계 조회
 */
export async function fetchReferrerStats(): Promise<{
  total: number
  pending: number
  completed: number
  totalReward: number
  paidReward: number
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { total: 0, pending: 0, completed: 0, totalReward: 0, paidReward: 0 }
    }

    const { data, error } = await supabaseAny
      .from('product_applications')
      .select('status, referrer_reward_amount, referrer_reward_status')
      .eq('referrer_user_id', user.id)

    if (error) {
      console.error('Error fetching referrer stats:', error)
      return { total: 0, pending: 0, completed: 0, totalReward: 0, paidReward: 0 }
    }

    const applications = data || []
    return {
      total: applications.length,
      pending: applications.filter((a: any) => a.status === 'pending').length,
      completed: applications.filter((a: any) => a.status === 'completed').length,
      totalReward: applications.reduce((sum: number, a: any) => sum + (a.referrer_reward_amount || 0), 0),
      paidReward: applications
        .filter((a: any) => a.referrer_reward_status === 'paid')
        .reduce((sum: number, a: any) => sum + (a.referrer_reward_amount || 0), 0),
    }
  } catch (error) {
    console.error('Error fetching referrer stats:', error)
    return { total: 0, pending: 0, completed: 0, totalReward: 0, paidReward: 0 }
  }
}
