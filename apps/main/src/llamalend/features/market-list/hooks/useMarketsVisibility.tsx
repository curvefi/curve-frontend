import { useMemo } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { useVisibilitySettings } from '@evm-ui/shared/ui/DataTable/hooks/useVisibilitySettings'
import { SortingState } from '@tanstack/react-table'
import {
  DEFAULT_SORT,
  MarketColumnId,
  createMarketsMobileColumns,
  useMarketColumns,
  useMarketsColumnOptions,
} from '../columns'

type MarketColumnVariant = keyof ReturnType<typeof useMarketsColumnOptions>

export const getMarketsColumnVariant = (
  userHasPositions: LlamaMarketsResult['userHasPositions'] | undefined,
): MarketColumnVariant =>
  userHasPositions == null // we treat undefined (loading),  and null (no positions at all) as the same variant
    ? 'noPositions'
    : 'hasPositions' // show the general market table, for users with positions

const migration = { version: 7 }

/**
 * Hook to manage the visibility of columns in the markets table.
 * The visibility on mobile is based on the sort field.
 * On larger devices, it uses the visibility settings that may be customized by the user.
 */
export const useMarketsVisibility = (
  title: string,
  sorting: SortingState,
  variant: MarketColumnVariant,
  columns: ReturnType<typeof useMarketColumns>,
) => {
  const columnOptions = useMarketsColumnOptions()
  const sortField = (sorting.length ? sorting : DEFAULT_SORT)[0].id as MarketColumnId
  const visibilitySettings = useVisibilitySettings(title, columnOptions, variant, columns, migration)
  const columnVisibility = useMemo(() => createMarketsMobileColumns(sortField), [sortField])
  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
