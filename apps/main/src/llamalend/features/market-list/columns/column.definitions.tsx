import { ReactNode } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { SolvencyTooltip } from '@/llamalend/widgets/tooltips'
import type { ColumnDefinition } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { boolFilterFn, listNotEmptyFilterFn, multiFilterFn, rangeFilterFn } from '@evm-ui/shared/ui/DataTable/filters'
import { MarketRateType } from '@evm-ui/types/market'
import { type ColumnMeta, createColumnHelper, FilterFnOption } from '@tanstack/react-table'
import { type AccessorFn, type DeepKeys } from '@tanstack/table-core'
import {
  BoostCell,
  CompactUsdCell,
  HealthCell,
  LineGraphCell,
  LiquidityUsdCell,
  LtvCell,
  MarketTitleCell,
  MaxLeverageCell,
  PercentCell,
  PriceCell,
  RateCell,
  SolvencyCell,
  TvlCell,
  UtilizationCell,
} from '../cells'
import {
  CollateralBorrowHeaderTooltipContent,
  LendRateHeaderTooltipContent,
  LiquidityUsdHeaderTooltipContent,
  NetBorrowAprHeaderTooltipContent,
  TvlHeaderTooltipContent,
  UtilizationHeaderTooltipContent,
} from '../header-tooltips'
import {
  getUserBorrowedUsd,
  getUserCollateralUsd,
  getUserPositionHealth,
  getUserPositionLtv,
} from '../user-position.utils'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'

type Tooltip = ColumnMeta<never, never>['tooltip']
type MarketColumn = ColumnDefinition<LlamaMarketRow>
type MarketColumnOptions = Omit<MarketColumn, 'id' | 'header'>
type MarketAccessor = DeepKeys<LlamaMarketRow> | AccessorFn<LlamaMarketRow>

const createTooltip = (id: keyof typeof MARKET_TITLES, body: ReactNode): Tooltip => ({
  title: MARKET_TITLES[id],
  body,
})

/** Define an accessor column using separate data and table identifiers. */
const accessor = (id: MarketColumnId, field: MarketAccessor, column: MarketColumnOptions): MarketColumn =>
  createColumnHelper<LlamaMarketRow>().accessor(field, {
    ...column,
    id,
    header: MARKET_TITLES[id],
  })

/** Define a hidden column. */
const hidden = (id: MarketColumnId, field: DeepKeys<LlamaMarketRow>, filterFn: FilterFnOption<LlamaMarketRow>) =>
  accessor(id, field, {
    filterFn,
    meta: { hidden: true },
  })

/** Columns for the lending markets table. */
export const MARKET_COLUMNS = [
  accessor(
    MarketColumnId.Assets,
    ({ assets }) => `${assets.collateral.symbol.toLowerCase()}•${assets.borrowed.symbol.toLowerCase()}`,
    {
      cell: MarketTitleCell,
      meta: { tooltip: createTooltip(MarketColumnId.Assets, <CollateralBorrowHeaderTooltipContent />) },
    },
  ),
  accessor(MarketColumnId.UserBorrowed, getUserBorrowedUsd, {
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.UserCollateral, getUserCollateralUsd, {
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.UserEarnings, 'lendingPosition.earnings', {
    cell: PriceCell,
    meta: { type: 'numeric', hidden: true }, // hidden until we have a backend
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.UserDeposited, 'lendingPosition.supplied', {
    cell: PriceCell,
    meta: { type: 'numeric' },
    filterFn: boolFilterFn,
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.UserBoostMultiplier, 'lendingPosition.boostMultiplier', {
    cell: BoostCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.BorrowRate, 'rates.borrowApr', {
    cell: RateCell,
    meta: {
      type: 'numeric',
      unit: 'percentage',
    },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  accessor(MarketColumnId.NetBorrowRate, 'rates.borrowTotalApr', {
    cell: RateCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(MarketColumnId.NetBorrowRate, <NetBorrowAprHeaderTooltipContent />),
    },
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.UserLtv, getUserPositionLtv, {
    cell: LtvCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.UserHealth, getUserPositionHealth, {
    cell: HealthCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.LendRate, 'rates.lendTotalApyMinBoosted', {
    cell: RateCell,
    meta: { type: 'numeric', tooltip: createTooltip(MarketColumnId.LendRate, <LendRateHeaderTooltipContent />) },
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.BorrowChart, 'rates.borrowApr', {
    cell: c => <LineGraphCell market={c.row.original} type={MarketRateType.Borrow} />,
  }),
  accessor(MarketColumnId.MaxLeverage, 'leverage', {
    cell: MaxLeverageCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.MaxLtv, MarketColumnId.MaxLtv, {
    cell: PercentCell,
    meta: { type: 'numeric', unit: 'percentage' },
    filterFn: rangeFilterFn,
  }),
  accessor(MarketColumnId.UtilizationPercent, MarketColumnId.UtilizationPercent, {
    cell: UtilizationCell,
    meta: {
      type: 'numeric',
      unit: 'percentage',
      tooltip: createTooltip(MarketColumnId.UtilizationPercent, <UtilizationHeaderTooltipContent />),
    },
    filterFn: rangeFilterFn,
  }),
  accessor(
    MarketColumnId.SolvencyPercent,
    // Normalize null to undefined so sortUndefined places missing solvency values last
    ({ solvencyPercent }) => solvencyPercent ?? undefined,
    {
      cell: SolvencyCell,
      meta: {
        type: 'numeric',
        unit: 'percentage',
        tooltip: createTooltip(MarketColumnId.SolvencyPercent, <SolvencyTooltip type="overview" />),
      },
      sortUndefined: 'last',
    },
  ),
  accessor(MarketColumnId.LiquidityUsd, MarketColumnId.LiquidityUsd, {
    cell: LiquidityUsdCell,
    meta: {
      type: 'numeric',
      unit: 'dollar',
      tooltip: createTooltip(MarketColumnId.LiquidityUsd, <LiquidityUsdHeaderTooltipContent />),
    },
    filterFn: rangeFilterFn,
  }),
  accessor(MarketColumnId.TotalDebt, MarketColumnId.TotalDebt, {
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.TotalCollateralUsd, MarketColumnId.TotalCollateralUsd, {
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(MarketColumnId.Tvl, MarketColumnId.Tvl, {
    cell: TvlCell,
    meta: {
      type: 'numeric',
      unit: 'dollar',
      tooltip: createTooltip(MarketColumnId.Tvl, <TvlHeaderTooltipContent />),
    },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  // Following columns are used in tanstack filter, but they are displayed together in MarketTitleCell
  hidden(MarketColumnId.Chain, MarketColumnId.Chain, multiFilterFn),
  hidden(MarketColumnId.CollateralSymbol, 'assets.collateral.symbol', multiFilterFn),
  hidden(MarketColumnId.BorrowedSymbol, 'assets.borrowed.symbol', multiFilterFn),
  hidden(MarketColumnId.IsFavorite, MarketColumnId.IsFavorite, boolFilterFn),
  hidden(MarketColumnId.Rewards, MarketColumnId.Rewards, listNotEmptyFilterFn),
  hidden(MarketColumnId.DeprecatedMessage, MarketColumnId.DeprecatedMessage, boolFilterFn),
  hidden(MarketColumnId.Type, MarketColumnId.Type, multiFilterFn),
  hidden(MarketColumnId.Version, MarketColumnId.Version, multiFilterFn),
] satisfies MarketColumn[]
