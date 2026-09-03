import { isEqual } from 'lodash'
import { useMemo } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import type { MigrationOptions } from '@evm-ui/hooks/useStoredState'
import {
  preserveVisibilityChoices,
  useVisibilitySettings,
} from '@evm-ui/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@evm-ui/shared/ui/DataTable/visibility.types'
import { mapRecord } from '@primitives/objects.utils'
import { SortingState } from '@tanstack/react-table'
import {
  DEFAULT_SORT,
  MARKET_COLUMNS,
  MARKETS_COLUMN_OPTIONS,
  MarketColumnId,
  createMarketsMobileColumns,
} from '../columns'

type MarketColumnVariant = keyof typeof MARKETS_COLUMN_OPTIONS

const resolveMarketActive = (
  preservedActive: boolean,
  currentOption: VisibilityGroup<MarketColumnId>['options'][number],
) =>
  isEqual(currentOption.columns, [MarketColumnId.NetBorrowRate])
    ? currentOption.active
    : !isEqual(currentOption.columns, [MarketColumnId.BorrowRate]) && preservedActive

const migration: MigrationOptions<Record<MarketColumnVariant, VisibilityGroup<MarketColumnId>[]>> = {
  version: 6,
  migrate: (oldValue, initialValue) =>
    mapRecord(initialValue, (variant, currentGroups) =>
      preserveVisibilityChoices(oldValue[variant], currentGroups, resolveMarketActive),
    ),
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
  const sortField = (sorting.length ? sorting : DEFAULT_SORT)[0].id as MarketColumnId
  const visibilitySettings = useVisibilitySettings(title, MARKETS_COLUMN_OPTIONS, variant, MARKET_COLUMNS, migration)
  const columnVisibility = useMemo(() => createMarketsMobileColumns(sortField), [sortField])
  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
