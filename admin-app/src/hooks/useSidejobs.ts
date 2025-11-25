// React Query hooks for Admin Sidejob management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  AdminSidejobTemplateInput,
  AdminSidejobInstanceInput,
  AdminSidejobInstanceUpdateInput,
  TemplateFilters,
  InstanceFilters,
  PaginationParams,
} from '@/types/sidejob'
import {
  fetchTemplates,
  fetchTemplate,
  fetchTemplateWithStats,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  fetchInstances,
  fetchInstance,
  fetchInstancesByTemplate,
  createInstance,
  updateInstance,
  deleteInstance,
  bulkCreateInstances,
  fetchClicksByInstance,
  markClickAsConversion,
  fetchTemplateStats,
  fetchInstanceStats,
  searchUsersForAssignment,
} from '@/lib/api/sidejobs'

// ============================================================================
// TEMPLATE HOOKS
// ============================================================================

/**
 * Fetch templates list with filters and pagination
 */
export function useTemplates(
  filters: TemplateFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 20 }
) {
  return useQuery({
    queryKey: ['sidejob-templates', filters, pagination],
    queryFn: () => fetchTemplates(filters, pagination),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Fetch single template by ID
 */
export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: ['sidejob-template', templateId],
    queryFn: () => fetchTemplate(templateId),
    enabled: !!templateId,
  })
}

/**
 * Fetch template with statistics
 */
export function useTemplateWithStats(templateId: string) {
  return useQuery({
    queryKey: ['sidejob-template-stats', templateId],
    queryFn: () => fetchTemplateWithStats(templateId),
    enabled: !!templateId,
  })
}

/**
 * Create template mutation
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AdminSidejobTemplateInput) => createTemplate(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidejob-templates'] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-template-stats'] })
    },
  })
}

/**
 * Update template mutation
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      templateId,
      input,
    }: {
      templateId: string
      input: Partial<AdminSidejobTemplateInput>
    }) => updateTemplate(templateId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sidejob-templates'] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-template', variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-template-stats'] })
    },
  })
}

/**
 * Delete template mutation
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      templateId,
      permanent,
    }: {
      templateId: string
      permanent?: boolean
    }) => deleteTemplate(templateId, permanent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidejob-templates'] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-template-stats'] })
    },
  })
}

// ============================================================================
// INSTANCE HOOKS
// ============================================================================

/**
 * Fetch instances list with filters and pagination
 */
export function useInstances(
  filters: InstanceFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 20 }
) {
  return useQuery({
    queryKey: ['sidejob-instances', filters, pagination],
    queryFn: () => fetchInstances(filters, pagination),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Fetch single instance by ID
 */
export function useInstance(instanceId: string) {
  return useQuery({
    queryKey: ['sidejob-instance', instanceId],
    queryFn: () => fetchInstance(instanceId),
    enabled: !!instanceId,
  })
}

/**
 * Fetch instances by template ID
 */
export function useInstancesByTemplate(templateId: string) {
  return useQuery({
    queryKey: ['sidejob-instances-by-template', templateId],
    queryFn: () => fetchInstancesByTemplate(templateId),
    enabled: !!templateId,
  })
}

/**
 * Create instance mutation
 */
export function useCreateInstance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AdminSidejobInstanceInput) => createInstance(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sidejob-instances'] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-instances-by-template', variables.template_id] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-template', variables.template_id] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-instance-stats'] })
    },
  })
}

/**
 * Update instance mutation
 */
export function useUpdateInstance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      instanceId,
      input,
    }: {
      instanceId: string
      input: AdminSidejobInstanceUpdateInput
    }) => updateInstance(instanceId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sidejob-instances'] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-instance', variables.instanceId] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-instance-stats'] })
    },
  })
}

/**
 * Delete instance mutation
 */
export function useDeleteInstance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (instanceId: string) => deleteInstance(instanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidejob-instances'] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-instance-stats'] })
    },
  })
}

/**
 * Bulk create instances mutation
 */
export function useBulkCreateInstances() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inputs: AdminSidejobInstanceInput[]) => bulkCreateInstances(inputs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidejob-instances'] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-templates'] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-instance-stats'] })
    },
  })
}

// ============================================================================
// CLICK TRACKING HOOKS
// ============================================================================

/**
 * Fetch clicks for an instance
 */
export function useClicksByInstance(
  instanceId: string,
  pagination: PaginationParams = { page: 1, per_page: 50 }
) {
  return useQuery({
    queryKey: ['sidejob-clicks', instanceId, pagination],
    queryFn: () => fetchClicksByInstance(instanceId, pagination),
    enabled: !!instanceId,
  })
}

/**
 * Mark click as conversion mutation
 */
export function useMarkClickAsConversion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      clickId,
      conversionType,
      conversionValue,
    }: {
      clickId: string
      conversionType: string
      conversionValue?: number
    }) => markClickAsConversion(clickId, conversionType, conversionValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidejob-clicks'] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-instances'] })
      queryClient.invalidateQueries({ queryKey: ['sidejob-templates'] })
    },
  })
}

// ============================================================================
// STATISTICS HOOKS
// ============================================================================

/**
 * Fetch overall template statistics
 */
export function useTemplateStats() {
  return useQuery({
    queryKey: ['sidejob-template-stats-overview'],
    queryFn: fetchTemplateStats,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Fetch instance statistics
 */
export function useInstanceStats() {
  return useQuery({
    queryKey: ['sidejob-instance-stats'],
    queryFn: fetchInstanceStats,
    staleTime: 60000, // 1 minute
  })
}

// ============================================================================
// USER SEARCH HOOK
// ============================================================================

/**
 * Search users for assignment
 */
export function useSearchUsersForAssignment(
  search: string,
  subscriptionTier?: 'FREE' | 'PREMIUM' | 'BUSINESS'
) {
  return useQuery({
    queryKey: ['users-for-assignment', search, subscriptionTier],
    queryFn: () => searchUsersForAssignment(search, subscriptionTier),
    enabled: search.length >= 2, // Only search with 2+ characters
    staleTime: 30000,
  })
}
