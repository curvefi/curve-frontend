import { isEqual } from 'lodash'
import { useMemo } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { mapRecord } from '@primitives/objects.utils'
import { SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import {
  DEFAULT_SORT,
  MARKET_COLUMNS,
  MARKETS_COLUMN_OPTIONS,
  MarketColumnId,
  createMarketsMobileColumns,
} from '../columns'

type MarketColumnVariant = keyof typeof MARKETS_COLUMN_OPTIONS

/** Preserve users' saved visibility choices while adding newly introduced column options from defaults. */
const mergeVisibilityGroups = (
  oldGroups: VisibilityGroup<MarketColumnId>[] | undefined,
  initialGroups: VisibilityGroup<MarketColumnId>[],
): VisibilityGroup<MarketColumnId>[] =>
  initialGroups.map((initialGroup, index) => {
    const oldGroup = oldGroups?.find(group => group.label === initialGroup.label) ?? oldGroups?.[index]
    return oldGroup
      ? {
          ...initialGroup,
          options: initialGroup.options.map(initialOption => {
            const oldOption =
              oldGroup.options.find(oldOption => isEqual(oldOption.columns, initialOption.columns)) ?? initialOption
            return isEqual(initialOption.columns, [MarketColumnId.NetBorrowRate])
              ? { ...oldOption, active: initialOption.active }
              : isEqual(initialOption.columns, [MarketColumnId.BorrowRate])
                ? { ...oldOption, active: false }
                : oldOption
          }),
        }
      : initialGroup
  })

export const getMarketsColumnVariant = (
  userHasPositions: LlamaMarketsResult['userHasPositions'] | undefined,
): MarketColumnVariant =>
  userHasPositions == null // we treat undefined (loading),  and null (no positions at all) as the same variant
    ? 'noPositions'
    : 'hasPositions' // show the general market table, for users with positions

const migration: MigrationOptions<Record<MarketColumnVariant, VisibilityGroup<MarketColumnId>[]>> = {
  version: 6,
  migrate: (oldValue, initialValue) =>
    mapRecord(initialValue, (variant, initialGroups) => mergeVisibilityGroups(oldValue[variant], initialGroups)),
}

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
