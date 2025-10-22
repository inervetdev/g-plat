import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

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

  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  updateLastLogin: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      adminUser: null,
      isLoading: true,
      isAuthenticated: false,

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
        try {
          set({ isLoading: true })

          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error) throw error

          if (!session) {
            set({ user: null, adminUser: null, isAuthenticated: false, isLoading: false })
            return
          }

          // Fetch admin user profile
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .eq('is_active', true)
            .single()

          if (adminError || !adminData) {
            // If admin profile not found or inactive, sign out
            await supabase.auth.signOut()
            set({ user: null, adminUser: null, isAuthenticated: false, isLoading: false })
            return
          }

          set({
            user: session.user,
            adminUser: adminData,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          console.error('Check auth error:', error)
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
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        // Only persist authentication status, not the full user object
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Setup auth state change listener
supabase.auth.onAuthStateChange(async (event, _session) => {
  console.log('Auth state changed:', event)

  if (event === 'SIGNED_OUT') {
    useAuthStore.getState().signOut()
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Recheck auth to fetch admin profile
    await useAuthStore.getState().checkAuth()
  }
})
