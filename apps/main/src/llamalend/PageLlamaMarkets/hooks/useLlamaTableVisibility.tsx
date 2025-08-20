import { useMemo } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from '@/llamalend/PageLlamaMarkets/columns'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import {
  createLlamaMarketsMobileColumns,
  LLAMA_MARKETS_COLUMN_OPTIONS,
} from '@/llamalend/PageLlamaMarkets/hooks/useLlamaMarketsColumnVisibility'
import { SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable'
import { MarketRateType } from '@ui-kit/types/market'

const getVariant = (
  userPositions: LlamaMarketsResult['userPositions'] | MarketRateType | undefined,
): keyof typeof LLAMA_MARKETS_COLUMN_OPTIONS =>
  userPositions === undefined // undefined means its loading
    ? 'unknown'
    : userPositions === null // null means no positions at all
      ? 'noPositions'
      : typeof userPositions == 'string'
        ? userPositions // show variant for a specific market rate type
        : 'hasPositions' // show the general market table, for users with positions

/**
 * Hook to manage the visibility of columns in the Llama Markets table.
 * The visibility on mobile is based on the sort field.
 * On larger devices, it uses the visibility settings that may be customized by the user.
 */
export const useLlamaTableVisibility = (
  title: string,
  sorting: SortingState,
  userPositions: LlamaMarketsResult['userPositions'] | MarketRateType | undefined,
) => {
  const variant = getVariant(userPositions)
  const sortField = (sorting.length ? sorting : DEFAULT_SORT)[0].id as LlamaMarketColumnId
  const visibilitySettings = useVisibilitySettings(title, LLAMA_MARKETS_COLUMN_OPTIONS, variant, LLAMA_MARKET_COLUMNS)
  const columnVisibility = useMemo(() => createLlamaMarketsMobileColumns(sortField), [sortField])
  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
