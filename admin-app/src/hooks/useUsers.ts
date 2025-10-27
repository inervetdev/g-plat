// React Query hooks for user management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserFilters, PaginationParams } from '@/types/admin'
import {
  fetchUsers,
  fetchUser,
  updateUserStatus,
  updateUserSubscription,
  deleteUser
} from '@/lib/api/users'

/**
 * Fetch users list with filters and pagination
 */
export function useUsers(filters: UserFilters = {}, pagination: PaginationParams = { page: 1, per_page: 50 }) {
  return useQuery({
    queryKey: ['users', filters, pagination],
    queryFn: () => fetchUsers(filters, pagination),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Fetch single user by ID
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  })
}

/**
 * Update user status mutation
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, status, reason }: {
      userId: string
      status: 'active' | 'inactive' | 'suspended'
      reason?: string
    }) => updateUserStatus(userId, status, reason),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * Update user subscription mutation
 */
export function useUpdateUserSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, tier }: {
      userId: string
      tier: 'free' | 'premium' | 'business'
    }) => updateUserSubscription(userId, tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * Delete user mutation
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, permanent }: { userId: string; permanent?: boolean }) =>
      deleteUser(userId, permanent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
