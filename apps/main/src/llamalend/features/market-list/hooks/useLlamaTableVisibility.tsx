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

const mergeVisibilityGroups = (
  oldGroups: VisibilityGroup<LlamaMarketColumnId>[],
  initialGroups: VisibilityGroup<LlamaMarketColumnId>[],
) =>
  initialGroups.map((group, index) => {
    const previousGroup = oldGroups.find(({ label }) => label === group.label) ?? oldGroups[index]
    return {
      ...group,
      options: group.options.map(option => ({
        ...option,
        active:
          previousGroup?.options.find(previousOption => isEqual(previousOption.columns, option.columns))?.active ??
          option.active,
      })),
    }
  })

const migration: MigrationOptions<Record<LlamaColumnVariant, VisibilityGroup<LlamaMarketColumnId>[]>> = {
  version: 3,
  migrate: (oldValue, initialValue) =>
    mapRecord(initialValue, (variant, initialGroups) => mergeVisibilityGroups(oldValue[variant] ?? [], initialGroups)),
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
