import { useMemo } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import {
  DEFAULT_SORT,
  LLAMA_MARKET_COLUMNS,
  LLAMA_MARKETS_COLUMN_OPTIONS,
  LlamaMarketColumnId,
  createLlamaMarketsMobileColumns,
} from '../columns'

type LlamaColumnVariant = keyof typeof LLAMA_MARKETS_COLUMN_OPTIONS

export const getLlamaMarketsColumnVariant = (
  userHasPositions: LlamaMarketsResult['userHasPositions'] | undefined,
): LlamaColumnVariant =>
  userHasPositions == null // we treat undefined (loading),  and null (no positions at all) as the same variant
    ? 'noPositions'
    : 'hasPositions' // show the general market table, for users with positions

const migration: MigrationOptions<Record<LlamaColumnVariant, VisibilityGroup<LlamaMarketColumnId>[]>> = {
  version: 4,
  migrate: (oldValue, initialValue) => ({
    ...initialValue,
    ...oldValue,
  }),
}

/**
 * Hook to manage the visibility of columns in the Llama Markets table.
 * The visibility on mobile is based on the sort field.
 * On larger devices, it uses the visibility settings that may be customized by the user.
 */
export const useLlamaTableVisibility = (title: string, sorting: SortingState, variant: LlamaColumnVariant) => {
  const sortField = (sorting.length ? sorting : DEFAULT_SORT)[0].id as LlamaMarketColumnId
  const visibilitySettings = useVisibilitySettings(
    title,
    LLAMA_MARKETS_COLUMN_OPTIONS,
    variant,
    LLAMA_MARKET_COLUMNS,
    migration,
  )
  const columnVisibility = useMemo(() => createLlamaMarketsMobileColumns(sortField), [sortField])
  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
