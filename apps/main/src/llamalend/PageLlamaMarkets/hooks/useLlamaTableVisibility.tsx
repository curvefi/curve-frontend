import { useMemo } from 'react'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from '@/llamalend/PageLlamaMarkets/columns'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import {
  createLlamaMarketsMobileColumns,
  LLAMA_MARKETS_COLUMN_OPTIONS,
} from '@/llamalend/PageLlamaMarkets/hooks/useLlamaMarketsColumnVisibility'
import { SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable'

/**
 * Hook to manage the visibility of columns in the Llama Markets table.
 * The visibility on mobile is based on the sort field.
 * On larger devices, it uses the visibility settings that may be customized by the user.
 */
export const useLlamaTableVisibility = (
  title: string,
  sorting: SortingState,
  variant: keyof typeof LLAMA_MARKETS_COLUMN_OPTIONS,
) => {
  const sortField = (sorting.length ? sorting : DEFAULT_SORT)[0].id as LlamaMarketColumnId
  const visibilitySettings = useVisibilitySettings(title, LLAMA_MARKETS_COLUMN_OPTIONS, variant, LLAMA_MARKET_COLUMNS)
  const columnVisibility = useMemo(() => createLlamaMarketsMobileColumns(sortField), [sortField])
  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
