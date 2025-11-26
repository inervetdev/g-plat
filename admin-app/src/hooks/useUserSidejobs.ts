/**
 * 사용자 부가명함 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUserSidejobs,
  fetchUserSidejob,
  updateUserSidejob,
  deleteUserSidejob,
  permanentDeleteUserSidejob,
  toggleUserSidejobActive,
  fetchUserSidejobStats,
  searchUsersForFilter,
} from '@/lib/api/userSidejobs'
import type {
  UserSidejobFilters,
  UserSidejobUpdateInput,
  PaginationParams,
} from '@/types/userSidejob'

// Query Keys
export const userSidejobKeys = {
  all: ['user-sidejobs'] as const,
  lists: () => [...userSidejobKeys.all, 'list'] as const,
  list: (filters: UserSidejobFilters, pagination: PaginationParams) =>
    [...userSidejobKeys.lists(), { filters, pagination }] as const,
  details: () => [...userSidejobKeys.all, 'detail'] as const,
  detail: (id: string) => [...userSidejobKeys.details(), id] as const,
  stats: () => [...userSidejobKeys.all, 'stats'] as const,
}

// ============================================================================
// 목록 조회 훅
// ============================================================================

export function useUserSidejobs(
  filters: UserSidejobFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 20 }
) {
  return useQuery({
    queryKey: userSidejobKeys.list(filters, pagination),
    queryFn: () => fetchUserSidejobs(filters, pagination),
    staleTime: 30 * 1000, // 30초
  })
}

// ============================================================================
// 단일 조회 훅
// ============================================================================

export function useUserSidejob(id: string | null) {
  return useQuery({
    queryKey: userSidejobKeys.detail(id || ''),
    queryFn: () => fetchUserSidejob(id!),
    enabled: !!id,
    staleTime: 60 * 1000, // 1분
  })
}

// ============================================================================
// 통계 조회 훅
// ============================================================================

export function useUserSidejobStats() {
  return useQuery({
    queryKey: userSidejobKeys.stats(),
    queryFn: fetchUserSidejobStats,
    staleTime: 60 * 1000, // 1분
  })
}

// ============================================================================
// 수정 훅
// ============================================================================

export function useUpdateUserSidejob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UserSidejobUpdateInput }) =>
      updateUserSidejob(id, input),
    onSuccess: (data) => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: userSidejobKeys.lists() })
      // 상세 캐시 업데이트
      queryClient.setQueryData(userSidejobKeys.detail(data.id), data)
      // 통계 캐시 무효화
      queryClient.invalidateQueries({ queryKey: userSidejobKeys.stats() })
    },
  })
}

// ============================================================================
// 삭제 훅 (Soft Delete)
// ============================================================================

export function useDeleteUserSidejob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUserSidejob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSidejobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userSidejobKeys.stats() })
    },
  })
}

// ============================================================================
// 영구 삭제 훅
// ============================================================================

export function usePermanentDeleteUserSidejob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => permanentDeleteUserSidejob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSidejobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userSidejobKeys.stats() })
    },
  })
}

// ============================================================================
// 활성화 토글 훅
// ============================================================================

export function useToggleUserSidejobActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleUserSidejobActive(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userSidejobKeys.lists() })
      queryClient.setQueryData(userSidejobKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: userSidejobKeys.stats() })
    },
  })
}

// ============================================================================
// 사용자 검색 훅 (필터용)
// ============================================================================

export function useSearchUsersForFilter(search: string) {
  return useQuery({
    queryKey: ['user-search', search],
    queryFn: () => searchUsersForFilter(search),
    enabled: search.length >= 2,
    staleTime: 60 * 1000, // 1분
  })
}
