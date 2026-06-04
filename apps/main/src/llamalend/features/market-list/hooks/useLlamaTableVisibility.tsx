import { isEqual } from 'lodash'
import { useMemo } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { mapRecord } from '@primitives/objects.utils'
import { SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { MarketRateType } from '@ui-kit/types/market'
import {
  DEFAULT_SORT,
  LLAMA_MARKET_COLUMNS,
  LLAMA_MARKETS_COLUMN_OPTIONS,
  LlamaMarketColumnId,
  createLlamaMarketsMobileColumns,
} from '../columns'

type LlamaColumnVariant = keyof typeof LLAMA_MARKETS_COLUMN_OPTIONS

/** Preserve users' saved visibility choices while adding newly introduced column options from defaults. */
const mergeVisibilityGroups = (
  oldGroups: VisibilityGroup<LlamaMarketColumnId>[] | undefined,
  initialGroups: VisibilityGroup<LlamaMarketColumnId>[],
): VisibilityGroup<LlamaMarketColumnId>[] =>
  initialGroups.map((initialGroup, index) => {
    const oldGroup = oldGroups?.find(group => group.label === initialGroup.label) ?? oldGroups?.[index]
    return oldGroup
      ? {
          ...initialGroup,
          options: initialGroup.options.map(
            initialOption =>
              oldGroup.options.find(oldOption => isEqual(oldOption.columns, initialOption.columns)) ?? initialOption,
          ),
        }
      : initialGroup
  })

const getVariant = (
  userHasPositions: LlamaMarketsResult['userHasPositions'] | MarketRateType | undefined,
): LlamaColumnVariant =>
  userHasPositions == null // we treat undefined (loading),  and null (no positions at all) as the same variant
    ? 'noPositions'
    : typeof userHasPositions == 'string'
      ? userHasPositions // show variant for a specific market rate type
      : 'hasPositions' // show the general market table, for users with positions

const migration: MigrationOptions<Record<LlamaColumnVariant, VisibilityGroup<LlamaMarketColumnId>[]>> = {
  version: 5,
  migrate: (oldValue, initialValue) =>
    mapRecord(initialValue, (variant, initialGroups) => mergeVisibilityGroups(oldValue[variant], initialGroups)),
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
