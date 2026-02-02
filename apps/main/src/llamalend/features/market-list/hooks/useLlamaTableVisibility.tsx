import { useMemo } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { MarketRateType } from '@ui-kit/types/market'
import { DEFAULT_SORT } from '../columns'
import { LLAMA_MARKET_COLUMNS } from '../columns'
import { createLlamaMarketsMobileColumns, LLAMA_MARKETS_COLUMN_OPTIONS } from '../columns'
import { LlamaMarketColumnId } from '../columns'

type LlamaColumnVariant = keyof typeof LLAMA_MARKETS_COLUMN_OPTIONS

const getVariant = (
  userHasPositions: LlamaMarketsResult['userHasPositions'] | MarketRateType | undefined,
): LlamaColumnVariant =>
  userHasPositions === undefined // undefined means its loading
    ? 'unknown'
    : userHasPositions === null // null means no positions at all
      ? 'noPositions'
      : typeof userHasPositions == 'string'
        ? userHasPositions // show variant for a specific market rate type
        : 'hasPositions' // show the general market table, for users with positions

const migration: MigrationOptions<Record<LlamaColumnVariant, VisibilityGroup<LlamaMarketColumnId>[]>> = {
  version: 2,
  migrate: () => null, // reset stored visibility since column ids changed
}

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
