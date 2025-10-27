import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'content_admin' | 'marketing_admin' | 'viewer'
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  adminUser: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean
  initialized: boolean

  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  updateLastLogin: () => Promise<void>
  initAuthListener: () => (() => void) | undefined
}

// Flag to prevent multiple listener subscriptions
let authListenerInitialized = false

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      adminUser: null,
      isLoading: true,
      isAuthenticated: false,
      initialized: false,

      signIn: async (email: string, password: string) => {
        try {
          // Sign in with Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          if (!data.user) {
            throw new Error('No user returned from authentication')
          }

          // Fetch admin user profile
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', data.user.id)
            .eq('is_active', true)
            .single()

          if (adminError) {
            // If admin profile not found, sign out
            await supabase.auth.signOut()
            throw new Error('관리자 권한이 없습니다. 슈퍼 관리자에게 문의하세요.')
          }

          if (!adminData) {
            await supabase.auth.signOut()
            throw new Error('관리자 계정이 비활성화되었습니다.')
          }

          // Update state
          set({
            user: data.user,
            adminUser: adminData,
            isAuthenticated: true,
            isLoading: false,
          })

          // Update last login timestamp
          await get().updateLastLogin()
        } catch (error: any) {
          set({ user: null, adminUser: null, isAuthenticated: false, isLoading: false })
          throw error
        }
      },

      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error

          set({
            user: null,
            adminUser: null,
            isAuthenticated: false,
            isLoading: false,
          })
        } catch (error) {
          console.error('Sign out error:', error)
          // Force sign out on client side even if server fails
          set({
            user: null,
            adminUser: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      checkAuth: async () => {
        // Timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.error('⏱️ Auth check timeout - forcing loading to false')
          set({ isLoading: false, isAuthenticated: false })
        }, 10000) // 10 second timeout

        try {
          console.log('🔍 Starting auth check...')
          set({ isLoading: true })

          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession()
          console.log('📦 Session:', session ? 'Found' : 'None', error ? `Error: ${error.message}` : '')

          if (error) {
            console.error('❌ Session error:', error)
            clearTimeout(timeoutId)
            throw error
          }

          if (!session) {
            console.log('⚠️ No session found - redirecting to login')
            clearTimeout(timeoutId)
            set({ user: null, adminUser: null, isAuthenticated: false, isLoading: false })
            return
          }

          console.log('👤 Session user:', session.user.email, session.user.id)

          // Fetch admin user profile with timeout
          console.log('🔎 Fetching admin user profile...')
          const startTime = Date.now()

          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .eq('is_active', true)
            .single()

          const elapsed = Date.now() - startTime
          console.log(`📊 Admin query completed in ${elapsed}ms`)
          console.log('📊 Admin data:', adminData)
          console.log('📊 Admin error:', adminError)

          clearTimeout(timeoutId)

          if (adminError) {
            console.error('❌ Admin user query error:', {
              message: adminError.message,
              details: adminError.details,
              hint: adminError.hint,
              code: adminError.code
            })
          }

          if (adminError || !adminData) {
            // If admin profile not found or inactive, sign out
            console.error('❌ Admin user not found or inactive')
            console.log('🚪 Signing out user...')
            await supabase.auth.signOut()
            set({ user: null, adminUser: null, isAuthenticated: false, isLoading: false })
            return
          }

          console.log('✅ Auth check successful:', adminData.email, adminData.role)
          set({
            user: session.user,
            adminUser: adminData,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          console.error('❌ Check auth error:', {
            message: error?.message,
            stack: error?.stack,
            error
          })
          clearTimeout(timeoutId)
          set({ user: null, adminUser: null, isAuthenticated: false, isLoading: false })
        }
      },

      updateLastLogin: async () => {
        const { adminUser } = get()
        if (!adminUser) return

        try {
          await supabase
            .from('admin_users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', adminUser.id)
        } catch (error) {
          console.error('Failed to update last login:', error)
          // Don't throw error - this is not critical
        }
      },

      initAuthListener: () => {
        // Prevent multiple subscriptions
        if (authListenerInitialized) {
          console.log('⚠️ Auth listener already initialized - skipping')
          return undefined
        }

        console.log('🎧 Initializing auth listener...')
        authListenerInitialized = true

        // Setup auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, session: Session | null) => {
            console.log('🔐 Admin auth state changed:', event)

            // Only handle specific events to avoid loops
            if (event === 'SIGNED_OUT') {
              console.log('👋 User signed out')
              set({
                user: null,
                adminUser: null,
                isAuthenticated: false,
                isLoading: false,
              })
            } else if (event === 'SIGNED_IN' && session) {
              console.log('👤 User signed in, fetching admin profile...')
              // Fetch admin profile
              const { data: adminData, error: adminError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('id', session.user.id)
                .eq('is_active', true)
                .single()

              if (adminError || !adminData) {
                console.error('❌ Admin profile not found, signing out...')
                await supabase.auth.signOut()
                set({
                  user: null,
                  adminUser: null,
                  isAuthenticated: false,
                  isLoading: false,
                })
              } else {
                console.log('✅ Admin profile loaded:', adminData.email)
                set({
                  user: session.user,
                  adminUser: adminData,
                  isAuthenticated: true,
                  isLoading: false,
                })
              }
            }
            // Ignore TOKEN_REFRESHED and other events to prevent infinite loops
          }
        )

        set({ initialized: true })
        console.log('✅ Auth listener initialized')

        // Return unsubscribe function
        return () => {
          console.log('🔌 Unsubscribing auth listener...')
          subscription.unsubscribe()
          authListenerInitialized = false
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: () => ({
        // Don't persist anything - let session handle persistence
      }),
    }
  )
)
