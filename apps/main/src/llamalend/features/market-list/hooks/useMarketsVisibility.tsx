import { useMemo } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import { MaxLeverageTooltip } from '@/llamalend/widgets/tooltips'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { MarketRateType } from '@evm-ui/types/market'
import { mapRecord, notFalsy } from '@primitives/objects.utils'
import { SortingState } from '@tanstack/react-table'
import type { MigrationOptions } from '@ui/features/storage/useStoredState'
import { preserveVisibilityChoices, useVisibilitySettings } from '@ui/features/tables/hooks/useVisibilitySettings'
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
  BORROW_POSITION_COLUMN_ORDER,
  SUPPLY_POSITION_COLUMN_ORDER,
  POSITION_TABLE_ONLY_COLUMNS,
} from '../columns'

type MarketColumnVariant = keyof ReturnType<typeof getMarketsColumnOptions>
const BETA_ONLY_COLUMNS = [
  MarketColumnId.CollateralYield,
  MarketColumnId.UserReturnOnEquity,
  MarketColumnId.UserLeverage,
  MarketColumnId.UserLiquidationBuffer,
  MarketColumnId.UserLiquidationRange,
  ...POSITION_TABLE_ONLY_COLUMNS,
]

const betaMigration: MigrationOptions<Record<MarketColumnVariant, VisibilityGroup<MarketColumnId>[]>> = {
  version: 6,
  migrate: (oldValue, initialValue) =>
    mapRecord(initialValue, (variant, currentGroups) => preserveVisibilityChoices(oldValue[variant], currentGroups)),
}

const orderColumns = <T extends { id?: string }>(columns: readonly T[], order: readonly MarketColumnId[]) => {
  const byId = new Map(columns.map(column => [column.id, column]))
  return order.flatMap(id => notFalsy(byId.get(id)))
}

const withSupplyApy = <T extends { id?: string }>(column: T) => {
  if (column.id !== MarketColumnId.LendRate) return column
  const { accessorKey: _accessorKey, ...rest } = column as T & { accessorKey?: string }
  return {
    ...rest,
    header: t`Supply APY`,
    accessorFn: (row: LlamaMarketRow) => row.rates.lendApy ?? undefined,
  }
}

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
    (!beta && sorting.some(({ id }) => BETA_ONLY_COLUMNS.includes(id as MarketColumnId))) ||
    (beta &&
      variant === MarketRateType.Borrow &&
      sorting.some(({ id }) => (id as MarketColumnId) === MarketColumnId.UserLtv))
      ? defaultSort
      : sorting
  const sortField = (tableSorting.length ? tableSorting : defaultSort)[0].id as MarketColumnId
  const options = useMemo(() => getMarketsColumnOptions(beta), [beta])
  const columns = useMemo(
    () =>
      beta
        ? orderColumns(
            MARKET_COLUMNS.filter(
              column =>
                (variant === MarketRateType.Borrow || variant === MarketRateType.Supply ||
                  !POSITION_TABLE_ONLY_COLUMNS.includes(column.id as (typeof POSITION_TABLE_ONLY_COLUMNS)[number])) &&
                (variant !== MarketRateType.Borrow || column.id !== MarketColumnId.UserLtv),
            ).map(column => {
              if (variant === MarketRateType.Borrow && column.id === MarketColumnId.UserBorrowed)
                return { ...column, header: t`Total debt` }
              if (variant === MarketRateType.Borrow && column.id === MarketColumnId.UserCollateral)
                return { ...column, header: t`Collateral value` }
              if (variant === MarketRateType.Supply && column.id === MarketColumnId.LendRate) return withSupplyApy(column)
              if (variant === MarketRateType.Supply && column.id === MarketColumnId.UserEarnings) {
                const { hidden: _hidden, ...meta } = column.meta ?? {}
                return { ...column, meta }
              }
              if (variant === MarketRateType.Supply && column.id === MarketColumnId.SolvencyPercent)
                return { ...column, header: t`Market solvency` }
              if (column.id === MarketColumnId.MaxLeverage)
                return {
                  ...column,
                  meta: { ...column.meta, tooltip: { title: t`Maximum Leverage`, body: <MaxLeverageTooltip /> } },
                }
              return column
            }),
            variant === MarketRateType.Borrow
              ? BORROW_POSITION_COLUMN_ORDER
              : variant === MarketRateType.Supply
                ? SUPPLY_POSITION_COLUMN_ORDER
                : MARKET_COLUMNS.map(column => column.id as MarketColumnId),
          )
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
    [beta, variant],
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
