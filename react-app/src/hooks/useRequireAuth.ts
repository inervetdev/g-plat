import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface UseRequireAuthOptions {
  redirectTo?: string
  requireProfile?: boolean
  onAuthSuccess?: (user: User) => void
  onAuthFailure?: () => void
}

interface UseRequireAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  checkAuth: () => Promise<void>
}

/**
 * Custom hook to require authentication and handle auth state
 * Redirects to login page if user is not authenticated
 */
export function useRequireAuth({
  redirectTo = '/login',
  requireProfile = false,
  onAuthSuccess,
  onAuthFailure
}: UseRequireAuthOptions = {}): UseRequireAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const checkAuth = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (!session) {
        onAuthFailure?.()
        navigate(redirectTo)
        return
      }

      // Check if profile exists if required
      if (requireProfile) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (profileError || !profile) {
          console.warn('User profile not found, redirecting to profile setup')
          navigate('/profile/setup')
          return
        }
      }

      setUser(session.user)
      onAuthSuccess?.(session.user)
    } catch (err) {
      console.error('Auth check failed:', err)
      setError(err instanceof Error ? err.message : '인증 확인 중 오류가 발생했습니다')
      onAuthFailure?.()
      navigate(redirectTo)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        navigate(redirectTo)
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
        onAuthSuccess?.(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    error,
    checkAuth
  }
}

/**
 * Hook to check if user has a specific role or permission
 */
export function useAuthRole(requiredRole: string) {
  const { user } = useRequireAuth()
  const [hasRole, setHasRole] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setHasRole(false)
        setChecking(false)
        return
      }

      try {
        const { data } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()

        setHasRole(data?.subscription_tier === requiredRole)
      } catch (error) {
        console.error('Error checking role:', error)
        setHasRole(false)
      } finally {
        setChecking(false)
      }
    }

    checkRole()
  }, [user, requiredRole])

  return { hasRole, checking }
}

/**
 * Hook to handle authentication with loading states
 */
export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthenticated(!!session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthenticated(!!session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    authenticated,
    loading,
    signOut: async () => {
      await supabase.auth.signOut()
      setUser(null)
      setAuthenticated(false)
    }
  }
}

/**
 * Hook to protect routes based on subscription tier
 */
export function useSubscriptionGuard(
  requiredTier: 'free' | 'premium' | 'business',
  redirectPath: string = '/pricing'
) {
  const { user } = useRequireAuth()
  const navigate = useNavigate()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return

      try {
        const { data } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()

        const tierHierarchy = { free: 0, premium: 1, business: 2 }
        const userTier = data?.subscription_tier || 'free'
        const userLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0
        const requiredLevel = tierHierarchy[requiredTier]

        const access = userLevel >= requiredLevel
        setHasAccess(access)

        if (!access) {
          navigate(redirectPath)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
        setHasAccess(false)
        navigate(redirectPath)
      }
    }

    checkSubscription()
  }, [user, requiredTier, redirectPath, navigate])

  return hasAccess
}