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
  subscription_tier: 'FREE' | 'PREMIUM' | 'BUSINESS'
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
  subscription_tier?: 'FREE' | 'PREMIUM' | 'BUSINESS' | 'all'
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

// Business Card types
export interface BusinessCard {
  id: string
  user_id: string
  name: string
  title?: string
  company?: string
  department?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  address_detail?: string
  latitude?: number
  longitude?: number
  linkedin?: string
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
  github?: string
  bio?: string
  profile_image_url?: string
  company_logo_url?: string
  theme?: string
  custom_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CardWithStats extends BusinessCard {
  view_count: number
  qr_scan_count: number
  sidejob_count: number
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface CardDetailStats {
  total_views: number
  total_qr_scans: number
  total_sidejobs: number
  views_by_day: Array<{ date: string; views: number }>
  views_by_device: Array<{ device: string; count: number }>
  views_by_browser: Array<{ browser: string; count: number }>
  recent_visitors: Array<{
    id: string
    visited_at: string
    device?: string
    browser?: string
    referrer?: string
    visitor_ip?: string
  }>
}

export interface CardFilters {
  search?: string
  theme?: string
  is_active?: boolean | 'all'
  sort_by?: 'created_at' | 'updated_at' | 'view_count'
  sort_order?: 'asc' | 'desc'
}
