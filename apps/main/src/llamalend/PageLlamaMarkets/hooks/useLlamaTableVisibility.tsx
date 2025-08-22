import { useMemo } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import { SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable'
import { MarketRateType } from '@ui-kit/types/market'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from '../columns'
import { LlamaMarketColumnId } from '../columns.enum'
import { createLlamaMarketsMobileColumns, LLAMA_MARKETS_COLUMN_OPTIONS } from './useLlamaMarketsColumnVisibility'

const getVariant = (
  userHasPositions: LlamaMarketsResult['userHasPositions'] | MarketRateType | undefined,
): keyof typeof LLAMA_MARKETS_COLUMN_OPTIONS =>
  userHasPositions === undefined // undefined means its loading
    ? 'unknown'
    : userHasPositions === null // null means no positions at all
      ? 'noPositions'
      : typeof userHasPositions == 'string'
        ? userHasPositions // show variant for a specific market rate type
        : 'hasPositions' // show the general market table, for users with positions

/**
 * Hook to manage the visibility of columns in the Llama Markets table.
 * The visibility on mobile is based on the sort field.
 * On larger devices, it uses the visibility settings that may be customized by the user.
 */
export const useLlamaTableVisibility = (
  title: string,
  sorting: SortingState,
  userHasPositions: LlamaMarketsResult['userHasPositions'] | MarketRateType | undefined,
) => {
  const variant = getVariant(userHasPositions)
  const sortField = (sorting.length ? sorting : DEFAULT_SORT)[0].id as LlamaMarketColumnId
  const visibilitySettings = useVisibilitySettings(title, LLAMA_MARKETS_COLUMN_OPTIONS, variant, LLAMA_MARKET_COLUMNS)
  const columnVisibility = useMemo(() => createLlamaMarketsMobileColumns(sortField), [sortField])
  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
