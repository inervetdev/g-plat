// Admin-related TypeScript types

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'content_admin' | 'marketing_admin' | 'viewer'
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface AdminLog {
  id: string
  admin_id: string
  action: string
  target_type: 'user' | 'card' | 'sidejob' | 'qr' | 'report' | 'settings'
  target_id: string | null
  details: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  subscription_tier: 'free' | 'premium' | 'business'
  status: 'active' | 'inactive' | 'suspended'
  email_verified: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
}

export interface UserProfile {
  user_id: string
  company?: string
  position?: string
  profile_image?: string
  bio?: string
  website?: string
  social_links?: Record<string, string>
}

export interface UserWithStats extends User {
  card_count: number
  sidejob_count: number
  qr_scan_count: number
  total_views: number
}

export interface UserFilters {
  search?: string
  subscription_tier?: 'free' | 'premium' | 'business' | 'all'
  status?: 'active' | 'inactive' | 'suspended' | 'all'
  date_from?: string
  date_to?: string
  sort_by?: 'created_at' | 'last_login_at' | 'card_count'
  sort_order?: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  per_page: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
