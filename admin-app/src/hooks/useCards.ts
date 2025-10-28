// React Query hooks for business card management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CardFilters, PaginationParams } from '@/lib/api/cards'
import {
  fetchCards,
  fetchCard,
  updateCardStatus,
  updateCardTheme,
  deleteCard,
  bulkUpdateCards,
} from '@/lib/api/cards'

/**
 * Fetch cards list with filters and pagination
 */
export function useCards(
  filters: CardFilters = {},
  pagination: PaginationParams = { page: 1, per_page: 50 }
) {
  return useQuery({
    queryKey: ['cards', filters, pagination],
    queryFn: () => fetchCards(filters, pagination),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Fetch single card by ID
 */
export function useCard(cardId: string) {
  return useQuery({
    queryKey: ['card', cardId],
    queryFn: () => fetchCard(cardId),
    enabled: !!cardId,
  })
}

/**
 * Update card status mutation
 */
export function useUpdateCardStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardId, isActive }: { cardId: string; isActive: boolean }) =>
      updateCardStatus(cardId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

/**
 * Update card theme mutation
 */
export function useUpdateCardTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardId, theme }: { cardId: string; theme: string }) =>
      updateCardTheme(cardId, theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

/**
 * Delete card mutation
 */
export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardId, permanent }: { cardId: string; permanent?: boolean }) =>
      deleteCard(cardId, permanent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

/**
 * Bulk update cards mutation
 */
export function useBulkUpdateCards() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      cardIds,
      updates,
    }: {
      cardIds: string[]
      updates: { is_active?: boolean; theme?: string }
    }) => bulkUpdateCards(cardIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}
