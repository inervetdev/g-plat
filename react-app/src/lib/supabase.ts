import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Environment variable validation with type safety
interface SupabaseEnv {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
}

function validateEnv(): SupabaseEnv {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const errors: string[] = []

  // Validate URL (allow both http for local dev and https for production)
  if (!url) {
    errors.push('VITE_SUPABASE_URL is missing')
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with http:// or https://')
  }

  // Validate Anon Key
  if (!anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing')
  } else if (anonKey.length < 100) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)')
  }

  if (errors.length > 0) {
    const errorMessage = `
❌ Supabase Configuration Error:
${errors.map(e => `  • ${e}`).join('\n')}

Please check your environment variables:
  • For local development: Check .env file
  • For production: Check Vercel environment settings
    `
    console.error(errorMessage)
    throw new Error('Invalid Supabase configuration. See console for details.')
  }

  return {
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_ANON_KEY: anonKey
  }
}

const env = validateEnv()

// Create typed Supabase client
export const supabase = createClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // More secure flow
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'g-plat-web',
    },
  },
})

// Re-export types for convenience
import type { Tables as TablesType } from './database.types'
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database.types'

// Helper type exports for common table types
export type BusinessCard = TablesType<'business_cards'>
export type User = TablesType<'users'>
export type UserProfile = TablesType<'user_profiles'>
export type SideJobCard = TablesType<'sidejob_cards'>
export type VisitorStats = TablesType<'visitor_stats'>
export type CallbackLog = TablesType<'callback_logs'>
export type QRCode = TablesType<'qr_codes'>
export type QRScan = TablesType<'qr_scans'>
