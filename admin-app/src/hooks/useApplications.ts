// React Query hooks for Product Application management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  ApplicationFilters,
  ApplicationStatusUpdateInput,
  ApplicationAssignInput,
  ApplicationCompleteInput,
  PaginationParams,
} from '@/types/application'
import {
  fetchApplications,
  fetchApplication,
  fetchApplicationStats,
  assignApplication,
  updateApplicationStatus,
  completeApplication,
  cancelApplication,
  fetchApplicationLogs,
  fetchAdminUsers,
  fetchTemplatesForFilter,
  updateRewardStatus,
} from '@/lib/api/applications'

// ============================================================================
// APPLICATION HOOKS
// ============================================================================

/**
 * 신청 목록 조회
 */
export function useApplications(
  filters: ApplicationFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 50 }
) {
  return useQuery({
    queryKey: ['applications', filters, pagination],
    queryFn: () => fetchApplications(filters, pagination),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * 단일 신청 상세 조회
 */
export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => fetchApplication(applicationId),
    enabled: !!applicationId,
  })
}

/**
 * 신청 통계 조회
 */
export function useApplicationStats() {
  return useQuery({
    queryKey: ['application-stats'],
    queryFn: () => fetchApplicationStats(),
    staleTime: 60000, // 1 minute
  })
}

/**
 * 신청 처리 로그 조회
 */
export function useApplicationLogs(applicationId: string) {
  return useQuery({
    queryKey: ['application-logs', applicationId],
    queryFn: () => fetchApplicationLogs(applicationId),
    enabled: !!applicationId,
  })
}

/**
 * 관리자 목록 조회 (담당자 배정용)
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetchAdminUsers(),
    staleTime: 300000, // 5 minutes
  })
}

/**
 * 템플릿 목록 조회 (필터용)
 */
export function useTemplatesForFilter() {
  return useQuery({
    queryKey: ['templates-for-filter'],
    queryFn: () => fetchTemplatesForFilter(),
    staleTime: 300000, // 5 minutes
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * 담당자 배정
 */
export function useAssignApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApplicationAssignInput }) =>
      assignApplication(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['application-stats'] })
    },
  })
}

/**
 * 신청 상태 변경
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApplicationStatusUpdateInput }) =>
      updateApplicationStatus(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['application-logs', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['application-stats'] })
    },
  })
}

/**
 * 신청 완료 처리 (보상 설정 포함)
 */
export function useCompleteApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApplicationCompleteInput }) =>
      completeApplication(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['application-logs', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['application-stats'] })
    },
  })
}

/**
 * 신청 취소
 */
export function useCancelApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      cancelApplication(id, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['application-logs', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['application-stats'] })
    },
  })
}

/**
 * 보상 상태 업데이트
 */
export function useUpdateRewardStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'approved' | 'paid' }) =>
      updateRewardStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
    },
  })
}
