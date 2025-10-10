import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables check:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'exists' : 'missing',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'exists' : 'missing',
    allEnvVars: import.meta.env
  })
  throw new Error('Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment settings.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Database types (updated to match actual Supabase tables)
export type Database = {
  public: {
    Tables: {
      business_cards: {
        Row: {
          id: string
          user_id: string
          name: string
          title: string | null
          company: string | null
          department: string | null
          phone: string | null
          email: string | null
          website: string | null
          address: string | null
          linkedin: string | null
          instagram: string | null
          facebook: string | null
          twitter: string | null
          youtube: string | null
          github: string | null
          introduction: string | null
          services: string[] | null
          skills: string[] | null
          theme: string
          card_color: string | null
          font_style: string | null
          profile_image: string | null
          company_logo: string | null
          background_image: string | null
          qr_code: string | null
          custom_url: string | null
          short_url: string | null
          is_active: boolean
          is_primary: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          title?: string | null
          company?: string | null
          department?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          linkedin?: string | null
          instagram?: string | null
          facebook?: string | null
          twitter?: string | null
          youtube?: string | null
          github?: string | null
          introduction?: string | null
          services?: string[] | null
          skills?: string[] | null
          theme?: string
          card_color?: string | null
          font_style?: string | null
          profile_image?: string | null
          company_logo?: string | null
          background_image?: string | null
          qr_code?: string | null
          custom_url?: string | null
          short_url?: string | null
          is_active?: boolean
          is_primary?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          title?: string | null
          company?: string | null
          department?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          linkedin?: string | null
          instagram?: string | null
          facebook?: string | null
          twitter?: string | null
          youtube?: string | null
          github?: string | null
          introduction?: string | null
          services?: string[] | null
          skills?: string[] | null
          theme?: string
          card_color?: string | null
          font_style?: string | null
          profile_image?: string | null
          company_logo?: string | null
          background_image?: string | null
          qr_code?: string | null
          custom_url?: string | null
          short_url?: string | null
          is_active?: boolean
          is_primary?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          domain_name: string | null
          subscription_tier: 'FREE' | 'PREMIUM' | 'BUSINESS'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          domain_name?: string | null
          subscription_tier?: 'FREE' | 'PREMIUM' | 'BUSINESS'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          domain_name?: string | null
          subscription_tier?: 'FREE' | 'PREMIUM' | 'BUSINESS'
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          company: string | null
          position: string | null
          bio: string | null
          phone: string | null
          address: string | null
          profile_image: string | null
          theme_settings: any
          social_links: any
          callback_settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company?: string | null
          position?: string | null
          bio?: string | null
          phone?: string | null
          address?: string | null
          profile_image?: string | null
          theme_settings?: any
          social_links?: any
          callback_settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string | null
          position?: string | null
          bio?: string | null
          phone?: string | null
          address?: string | null
          profile_image?: string | null
          theme_settings?: any
          social_links?: any
          callback_settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      sidejob_cards: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          image_url: string | null
          price: string | null
          cta_text: string | null
          cta_link: string | null
          business_card_id: string | null
          display_order: number
          is_active: boolean
          view_count: number
          click_count: number
          category_primary: 'shopping' | 'education' | 'service' | 'subscription' | 'promotion' | null
          category_secondary: string | null
          tags: any | null
          badge: string | null
          expiry_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          image_url?: string | null
          price?: string | null
          cta_text?: string | null
          cta_link?: string | null
          business_card_id?: string | null
          display_order?: number
          is_active?: boolean
          view_count?: number
          click_count?: number
          category_primary?: 'shopping' | 'education' | 'service' | 'subscription' | 'promotion' | null
          category_secondary?: string | null
          tags?: any | null
          badge?: string | null
          expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          price?: string | null
          cta_text?: string | null
          cta_link?: string | null
          business_card_id?: string | null
          display_order?: number
          is_active?: boolean
          view_count?: number
          click_count?: number
          category_primary?: 'shopping' | 'education' | 'service' | 'subscription' | 'promotion' | null
          category_secondary?: string | null
          tags?: any | null
          badge?: string | null
          expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      visitor_stats: {
        Row: {
          id: string
          user_id: string
          visitor_ip: string | null
          user_agent: string | null
          referrer: string | null
          page_visited: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          visitor_ip?: string | null
          user_agent?: string | null
          referrer?: string | null
          page_visited: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          visitor_ip?: string | null
          user_agent?: string | null
          referrer?: string | null
          page_visited?: string
          created_at?: string
        }
      }
      callback_logs: {
        Row: {
          id: string
          user_id: string
          phone_number: string
          message_sent: string | null
          status: 'PENDING' | 'SENT' | 'FAILED'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          phone_number: string
          message_sent?: string | null
          status?: 'PENDING' | 'SENT' | 'FAILED'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          phone_number?: string
          message_sent?: string | null
          status?: 'PENDING' | 'SENT' | 'FAILED'
          created_at?: string
        }
      }
    }
  }
}