import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ColumnDef, createColumnHelper, FilterFnOption } from '@tanstack/react-table'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { t } from '@ui-kit/lib/i18n'
import {
  CompactUsdCell,
  LineGraphCell,
  MarketTitleCell,
  PercentageCell,
  RateCell,
} from '@/loan/components/PageLlamaMarkets/cells'
import { VisibilityGroup } from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'
import { PriceCell } from '@/loan/components/PageLlamaMarkets/cells/PriceCell'
import type { Address } from '@ui-kit/utils'
import { useMemo } from 'react'

const { ColumnWidth } = SizesAndSpaces

const columnHelper = createColumnHelper<LlamaMarket>()

const multiFilterFn: FilterFnOption<LlamaMarket> = (row, columnId, filterValue) =>
  !filterValue?.length || filterValue.includes(row.getValue(columnId))
const boolFilterFn: FilterFnOption<LlamaMarket> = (row, columnId, filterValue) =>
  filterValue === undefined || Boolean(row.getValue(columnId)) === Boolean(filterValue)

/** Define a hidden column. */
const hidden = (id: DeepKeys<LlamaMarket>, filterFn: FilterFnOption<LlamaMarket>) =>
  columnHelper.accessor(id, {
    filterFn,
    meta: { hidden: true },
  })

export enum LlamaMarketColumnId {
  Assets = 'assets',
  UserHealth = 'userHealth',
  UserBorrowed = 'userBorrowed',
  UserEarnings = 'userEarnings',
  UserDeposited = 'userDeposited',
  BorrowRate = 'rates.borrow',
  BorrowChart = 'borrowChart',
  LendRate = 'rates.lend',
  LendChart = 'lendChart',
  UtilizationPercent = 'utilizationPercent',
  LiquidityUsd = 'liquidityUsd',
  Chain = 'chain',
  CollateralSymbol = 'assets.collateral.symbol',
  BorrowedSymbol = 'assets.borrowed.symbol',
  IsFavorite = 'isFavorite',
  Rewards = 'rewards',
  Type = 'type',
}

/** Columns for the lending markets table. */
export const LLAMA_MARKET_COLUMNS = [
  columnHelper.accessor(LlamaMarketColumnId.Assets, {
    header: t`Collateral • Borrow`,
    cell: MarketTitleCell,
    size: ColumnWidth.lg,
  }),
  columnHelper.accessor(LlamaMarketColumnId.UserHealth, {
    header: t`Health`,
    cell: PercentageCell,
    meta: { type: 'numeric', hideZero: true },
    size: ColumnWidth.sm,
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.UserBorrowed, {
    header: t`Borrow Amount`,
    cell: PriceCell,
    meta: { type: 'numeric', borderRight: true },
    size: ColumnWidth.sm,
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.UserEarnings, {
    header: t`My Earnings`,
    cell: PriceCell,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.UserDeposited, {
    header: t`Supplied Amount`,
    cell: PriceCell,
    meta: { type: 'numeric', borderRight: true },
    size: ColumnWidth.sm,
    filterFn: boolFilterFn,
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.BorrowRate, {
    header: t`7D Avg Borrow Rate`,
    cell: (c) => <RateCell market={c.row.original} type="borrow" />,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrow', {
    id: LlamaMarketColumnId.BorrowChart,
    header: t`7D Borrow Rate Chart`,
    cell: (c) => <LineGraphCell market={c.row.original} type="borrow" />,
    size: ColumnWidth.md,
  }),
  columnHelper.accessor(LlamaMarketColumnId.LendRate, {
    header: t`7D Avg Supply Yield`,
    cell: (c) => <RateCell market={c.row.original} type="lend" />,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.lend', {
    id: LlamaMarketColumnId.LendChart,
    header: t`7D Supply Yield Chart`,
    cell: (c) => <LineGraphCell market={c.row.original} type="lend" />,
    size: ColumnWidth.md,
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.UtilizationPercent, {
    header: t`Utilization`,
    cell: PercentageCell,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
  }),
  columnHelper.accessor(LlamaMarketColumnId.LiquidityUsd, {
    header: () => t`Available Liquidity`,
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    size: ColumnWidth.sm,
  }),
  // Following columns are used in tanstack filter, but they are displayed together in MarketTitleCell
  hidden(LlamaMarketColumnId.Chain, multiFilterFn),
  hidden(LlamaMarketColumnId.CollateralSymbol, multiFilterFn),
  hidden(LlamaMarketColumnId.BorrowedSymbol, multiFilterFn),
  hidden(LlamaMarketColumnId.IsFavorite, boolFilterFn),
  hidden(LlamaMarketColumnId.Rewards, boolFilterFn),
  hidden(LlamaMarketColumnId.Type, multiFilterFn),
] satisfies ColumnDef<LlamaMarket, any>[]

export const DEFAULT_SORT = [{ id: LlamaMarketColumnId.LiquidityUsd, desc: true }]

export const useDefaultMarketColumnsVisibility: (address?: Address) => VisibilityGroup[] = (address) =>
  useMemo(
    () => [
      {
        label: t`Markets`,
        options: [
          { label: t`Available Liquidity`, columns: [LlamaMarketColumnId.LiquidityUsd], active: true, visible: true },
          { label: t`Utilization`, columns: [LlamaMarketColumnId.UtilizationPercent], active: true, visible: true },
        ],
      },
      {
        label: t`Borrow`,
        options: [
          { label: t`Chart`, columns: [LlamaMarketColumnId.BorrowChart], active: true, visible: true },
          {
            label: t`Borrow Details`,
            columns: [LlamaMarketColumnId.UserHealth, LlamaMarketColumnId.UserBorrowed],
            active: true,
            visible: !!address,
          },
        ],
      },
      {
        label: t`Lend`,
        options: [
          { label: t`Chart`, columns: [LlamaMarketColumnId.LendChart], active: true, visible: true },
          {
            label: t`Lend Details`,
            columns: [LlamaMarketColumnId.UserEarnings, LlamaMarketColumnId.UserDeposited],
            active: true,
            visible: !!address,
          },
        ],
      },
    ],
    [address],
  )
