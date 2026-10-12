import { useMemo } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { mapRecord } from '@primitives/objects.utils'
import { SortingState } from '@tanstack/react-table'
import type { MigrationOptions } from '@ui/features/storage/useStoredState'
import { preserveVisibilityChoices, useVisibilitySettings } from '@ui/features/tables/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@ui/features/tables/visibility.types'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { DEFAULT_SORT } from '../columns/column.constants'
import { createMarketsMobileColumns, MARKETS_COLUMN_OPTIONS } from '../columns/column.options'
import { MarketColumnId } from '../columns/columns.enum'

type MarketColumnVariant = keyof typeof MARKETS_COLUMN_OPTIONS

/** Keep filter-only columns and unavailable metrics hidden on every screen size. */
const FILTER_ONLY_COLUMNS = [
  MarketColumnId.Chain,
  MarketColumnId.CollateralSymbol,
  MarketColumnId.BorrowedSymbol,
  MarketColumnId.IsFavorite,
  MarketColumnId.Rewards,
  MarketColumnId.DeprecatedMessage,
  MarketColumnId.Type,
  MarketColumnId.Version,
  MarketColumnId.UserEarnings, // hidden until we have a backend
]

const migration: MigrationOptions<Record<MarketColumnVariant, VisibilityGroup<MarketColumnId>[]>> = {
  version: 7,
  migrate: (oldValue, initialValue) =>
    mapRecord(initialValue, (variant, currentGroups) => preserveVisibilityChoices(oldValue[variant], currentGroups)),
}

export const getMarketsColumnVariant = (
  userHasPositions: LlamaMarketsResult['userHasPositions'] | undefined,
): MarketColumnVariant =>
  userHasPositions == null // we treat undefined (loading),  and null (no positions at all) as the same variant
    ? 'noPositions'
    : 'hasPositions' // show the general market table, for users with positions

/**
 * Hook to manage the visibility of columns in the markets table.
 * The visibility on mobile is based on the sort field.
 * On larger devices, it uses the visibility settings that may be customized by the user.
 */
export const useMarketsVisibility = (title: string, sorting: SortingState, variant: MarketColumnVariant) => {
  const isMobile = useIsMobile()
  const sortField = (sorting.length ? sorting : DEFAULT_SORT)[0].id as MarketColumnId
  const visibilitySettings = useVisibilitySettings(title, MARKETS_COLUMN_OPTIONS, variant, migration)
  const columnVisibility = useMemo(
    () => ({
      ...(isMobile ? createMarketsMobileColumns(sortField) : visibilitySettings.columnVisibility),
      ...Object.fromEntries(FILTER_ONLY_COLUMNS.map(id => [id, false])),
    }),
    [isMobile, sortField, visibilitySettings.columnVisibility],
  )

  return { sortField, ...visibilitySettings, columnVisibility }
}
