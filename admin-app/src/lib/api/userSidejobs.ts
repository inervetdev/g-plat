/**
 * 사용자 부가명함 API 함수
 * 대상: sidejob_cards 테이블 (사용자가 직접 생성한 부가명함)
 */

import { supabase } from '../supabase'
import type {
  UserSidejobCard,
  UserSidejobUpdateInput,
  UserSidejobFilters,
  UserSidejobStats,
  PaginationParams,
  PaginatedUserSidejobs,
  CategoryPrimary,
} from '@/types/userSidejob'

// ============================================================================
// 목록 조회
// ============================================================================

/**
 * 사용자 부가명함 목록 조회 (필터 & 페이지네이션)
 */
export async function fetchUserSidejobs(
  filters: UserSidejobFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 20 }
): Promise<PaginatedUserSidejobs> {
  const { page, per_page } = pagination
  const offset = (page - 1) * per_page

  // Note: auth.users 테이블은 직접 조인 불가, business_cards만 조인
  let query = supabase
    .from('sidejob_cards')
    .select(`
      *,
      business_card:business_cards!business_card_id (
        id,
        name,
        custom_url,
        user_id
      )
    `, { count: 'exact' })

  // 검색 필터
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // 카테고리 필터
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category_primary', filters.category)
  }

  // 활성 상태 필터
  if (filters.is_active !== undefined && filters.is_active !== 'all') {
    query = query.eq('is_active', filters.is_active)
  }

  // 사용자 ID 필터
  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id)
  }

  // 명함 ID 필터
  if (filters.business_card_id) {
    query = query.eq('business_card_id', filters.business_card_id)
  }

  // 정렬
  const sortBy = filters.sort_by || 'created_at'
  const sortOrder = filters.sort_order || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // 페이지네이션
  query = query.range(offset, offset + per_page - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching user sidejobs:', error)
    throw error
  }

  return {
    data: (data || []) as UserSidejobCard[],
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  }
}

// ============================================================================
// 단일 조회
// ============================================================================

/**
 * 단일 부가명함 조회
 */
export async function fetchUserSidejob(id: string): Promise<UserSidejobCard | null> {
  const { data, error } = await supabase
    .from('sidejob_cards')
    .select(`
      *,
      business_card:business_cards!business_card_id (
        id,
        name,
        custom_url,
        user_id
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching user sidejob:', error)
    throw error
  }

  return data as UserSidejobCard
}

// ============================================================================
// 수정
// ============================================================================

/**
 * 부가명함 수정
 */
export async function updateUserSidejob(
  id: string,
  input: UserSidejobUpdateInput
): Promise<UserSidejobCard> {
  const { data, error } = await supabase
    .from('sidejob_cards')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      business_card:business_cards!business_card_id (
        id,
        name,
        custom_url,
        user_id
      )
    `)
    .single()

  if (error) {
    console.error('Error updating user sidejob:', error)
    throw error
  }

  return data as UserSidejobCard
}

// ============================================================================
// 삭제 (Soft Delete)
// ============================================================================

/**
 * 부가명함 삭제 (soft delete - is_active = false)
 */
export async function deleteUserSidejob(id: string): Promise<void> {
  const { error } = await supabase
    .from('sidejob_cards')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error deleting user sidejob:', error)
    throw error
  }
}

/**
 * 부가명함 영구 삭제
 */
export async function permanentDeleteUserSidejob(id: string): Promise<void> {
  const { error } = await supabase
    .from('sidejob_cards')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error permanently deleting user sidejob:', error)
    throw error
  }
}

// ============================================================================
// 활성화 토글
// ============================================================================

/**
 * 부가명함 활성화/비활성화 토글
 */
export async function toggleUserSidejobActive(
  id: string,
  isActive: boolean
): Promise<UserSidejobCard> {
  const { data, error } = await supabase
    .from('sidejob_cards')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      business_card:business_cards!business_card_id (
        id,
        name,
        custom_url,
        user_id
      )
    `)
    .single()

  if (error) {
    console.error('Error toggling user sidejob active:', error)
    throw error
  }

  return data as UserSidejobCard
}

// ============================================================================
// 통계
// ============================================================================

/**
 * 사용자 부가명함 통계 조회
 */
export async function fetchUserSidejobStats(): Promise<UserSidejobStats> {
  // 전체 통계
  const { data: allData, error: allError } = await supabase
    .from('sidejob_cards')
    .select('id, is_active, view_count, click_count, category_primary')

  if (allError) {
    console.error('Error fetching user sidejob stats:', allError)
    throw allError
  }

  const cards = allData || []

  // 카테고리별 통계 계산
  const categoryStats: Record<CategoryPrimary, { count: number; views: number; clicks: number }> = {
    shopping: { count: 0, views: 0, clicks: 0 },
    education: { count: 0, views: 0, clicks: 0 },
    service: { count: 0, views: 0, clicks: 0 },
    subscription: { count: 0, views: 0, clicks: 0 },
    promotion: { count: 0, views: 0, clicks: 0 },
  }

  let total = 0
  let active = 0
  let inactive = 0
  let totalViews = 0
  let totalClicks = 0

  cards.forEach((card) => {
    total++
    if (card.is_active) {
      active++
    } else {
      inactive++
    }
    totalViews += card.view_count || 0
    totalClicks += card.click_count || 0

    const category = card.category_primary as CategoryPrimary
    if (category && categoryStats[category]) {
      categoryStats[category].count++
      categoryStats[category].views += card.view_count || 0
      categoryStats[category].clicks += card.click_count || 0
    }
  })

  return {
    total,
    active,
    inactive,
    total_views: totalViews,
    total_clicks: totalClicks,
    by_category: Object.entries(categoryStats).map(([category, stats]) => ({
      category: category as CategoryPrimary,
      ...stats,
    })),
  }
}

// ============================================================================
// 이미지 업로드 (관리자용)
// ============================================================================

/**
 * 부가명함 이미지 업로드 (관리자)
 * @param sidejobId 부가명함 ID
 * @param userId 소유자 user_id
 * @param file 이미지 파일
 */
export async function uploadSidejobImage(
  sidejobId: string,
  userId: string,
  file: File
): Promise<string> {
  // 파일 확장자 추출
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${userId}/${sidejobId}_${Date.now()}.${ext}`

  // Storage에 업로드
  const { error: uploadError } = await supabase.storage
    .from('sidejob-cards')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Error uploading image:', uploadError)
    throw uploadError
  }

  // Public URL 가져오기
  const { data } = supabase.storage
    .from('sidejob-cards')
    .getPublicUrl(fileName)

  return data.publicUrl
}

/**
 * 부가명함 이미지 삭제
 * @param imageUrl 이미지 URL
 */
export async function deleteSidejobImage(imageUrl: string): Promise<void> {
  // URL에서 파일 경로 추출
  const urlParts = imageUrl.split('/sidejob-cards/')
  if (urlParts.length < 2) return

  const filePath = urlParts[1]

  const { error } = await supabase.storage
    .from('sidejob-cards')
    .remove([filePath])

  if (error) {
    console.error('Error deleting image:', error)
    // Don't throw - image deletion failure shouldn't block other operations
  }
}

// ============================================================================
// 사용자 검색 (부가명함 필터용)
// ============================================================================

/**
 * 사용자 검색 (이메일, 이름)
 */
export async function searchUsersForFilter(
  search: string
): Promise<Array<{ id: string; email: string; name?: string }>> {
  if (!search || search.length < 2) {
    return []
  }

  const { data, error } = await supabase
    .from('auth.users')
    .select('id, email, raw_user_meta_data')
    .or(`email.ilike.%${search}%`)
    .limit(10)

  if (error) {
    // auth.users에 직접 접근이 안될 수 있으므로 business_cards에서 조회
    const { data: cardData, error: cardError } = await supabase
      .from('business_cards')
      .select('user_id, name')
      .or(`name.ilike.%${search}%`)
      .limit(10)

    if (cardError) {
      console.error('Error searching users:', cardError)
      return []
    }

    return (cardData || []).map((card) => ({
      id: card.user_id,
      email: '',
      name: card.name,
    }))
  }

  return (data || []).map((user) => ({
    id: user.id,
    email: user.email,
    name: user.raw_user_meta_data?.name || user.raw_user_meta_data?.full_name,
  }))
}

// ============================================================================
// 생성 (관리자용)
// ============================================================================

/**
 * 부가명함 생성 입력 타입
 */
export interface CreateUserSidejobInput {
  user_id: string
  business_card_id?: string
  title: string
  description?: string
  image_url?: string
  price?: string
  cta_text?: string
  cta_link?: string
  category_primary?: CategoryPrimary
  category_secondary?: string
  badge?: string
  is_active?: boolean
  display_order?: number
}

/**
 * 새 부가명함 생성 (관리자)
 */
export async function createUserSidejob(
  input: CreateUserSidejobInput
): Promise<UserSidejobCard> {
  console.log('Creating user sidejob:', input)

  const { data, error } = await supabase
    .from('sidejob_cards')
    .insert({
      user_id: input.user_id,
      business_card_id: input.business_card_id || null,
      title: input.title,
      description: input.description || null,
      image_url: input.image_url || null,
      price: input.price || null,
      cta_text: input.cta_text || null,
      cta_link: input.cta_link || null,
      category_primary: input.category_primary || null,
      category_secondary: input.category_secondary || null,
      badge: input.badge || null,
      is_active: input.is_active ?? true,
      display_order: input.display_order ?? 0,
      view_count: 0,
      click_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select(`
      *,
      business_card:business_cards!business_card_id (
        id,
        name,
        custom_url,
        user_id
      )
    `)
    .single()

  if (error) {
    console.error('Error creating user sidejob:', error)
    throw error
  }

  console.log('User sidejob created:', data)
  return data as UserSidejobCard
}

/**
 * 사용자별 명함 목록 조회 (부가명함 생성 시 선택용)
 */
export async function fetchBusinessCardsForUser(
  userId: string
): Promise<Array<{ id: string; name: string; custom_url: string | null }>> {
  const { data, error } = await supabase
    .from('business_cards')
    .select('id, name, custom_url')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching business cards:', error)
    return []
  }

  return data || []
}

/**
 * 검색으로 사용자 조회 (부가명함 생성 시 사용자 선택용)
 */
export async function searchUsersForSidejob(
  search: string
): Promise<Array<{ id: string; name: string; email?: string }>> {
  if (!search || search.length < 2) {
    return []
  }

  // business_cards에서 사용자 검색
  const { data, error } = await supabase
    .from('business_cards')
    .select('user_id, name')
    .or(`name.ilike.%${search}%`)
    .limit(20)

  if (error) {
    console.error('Error searching users:', error)
    return []
  }

  // 고유 사용자만 반환
  const uniqueUsers = new Map<string, { id: string; name: string }>()
  for (const card of data || []) {
    if (!uniqueUsers.has(card.user_id)) {
      uniqueUsers.set(card.user_id, {
        id: card.user_id,
        name: card.name,
      })
    }
  }

  return Array.from(uniqueUsers.values())
}
