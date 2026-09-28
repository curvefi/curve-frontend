import { useMemo } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import {
  preserveVisibilityChoices,
  useVisibilitySettings,
} from '@evm-ui/shared/ui/DataTable/hooks/useVisibilitySettings'
import { MarketRateType } from '@evm-ui/types/market'
import { mapRecord } from '@primitives/objects.utils'
import { SortingState } from '@tanstack/react-table'
import type { MigrationOptions } from '@ui/features/storage/useStoredState'
import type { VisibilityGroup } from '@ui/features/tables/visibility.types'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import {
  DEFAULT_SORT,
  DEFAULT_SORT_BORROW,
  DEFAULT_SORT_SUPPLY,
  MARKET_COLUMNS,
  getMarketsColumnOptions,
  MarketColumnId,
  createMarketsMobileColumns,
} from '../columns'

type MarketColumnVariant = keyof ReturnType<typeof getMarketsColumnOptions>
const BETA_ONLY_COLUMNS = [
  MarketColumnId.CollateralYield,
  MarketColumnId.UserReturnOnEquity,
  MarketColumnId.UserLiquidationBuffer,
]

const betaMigration: MigrationOptions<Record<MarketColumnVariant, VisibilityGroup<MarketColumnId>[]>> = { version: 1 }

const legacyMigration: MigrationOptions<Record<MarketColumnVariant, VisibilityGroup<MarketColumnId>[]>> = {
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
  const beta = useNewLlamalendHealth()
  const defaultSort =
    variant === MarketRateType.Borrow
      ? DEFAULT_SORT_BORROW
      : variant === MarketRateType.Supply
        ? DEFAULT_SORT_SUPPLY
        : DEFAULT_SORT
  const tableSorting =
    !beta && sorting.some(({ id }) => BETA_ONLY_COLUMNS.includes(id as MarketColumnId)) ? defaultSort : sorting
  const sortField = (tableSorting.length ? tableSorting : defaultSort)[0].id as MarketColumnId
  const options = useMemo(() => getMarketsColumnOptions(beta), [beta])
  const columns = useMemo(
    () =>
      beta
        ? MARKET_COLUMNS
        : MARKET_COLUMNS.filter(column => !BETA_ONLY_COLUMNS.includes(column.id as MarketColumnId)).map(column => {
            if (column.id === MarketColumnId.BorrowRate)
              return { ...column, meta: { ...column.meta, tooltip: undefined } }
            if (column.id === MarketColumnId.NetBorrowRate) {
              return {
                ...column,
                header: t`Net borrow APR`,
                meta: { ...column.meta, tooltip: { ...column.meta?.tooltip, title: t`Net borrow APR` } },
              }
            }
            return column
          }),
    [beta],
  )
  const visibilitySettings = useVisibilitySettings(
    beta ? `${title} Beta` : title,
    options,
    variant,
    columns,
    beta ? betaMigration : legacyMigration,
  )
  const columnVisibility = useMemo(() => createMarketsMobileColumns(sortField), [sortField])
  return { sortField, tableSorting, columns, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
