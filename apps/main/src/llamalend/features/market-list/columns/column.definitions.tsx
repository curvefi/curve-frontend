import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { SolvencyTooltip } from '@/llamalend/widgets/tooltips'
import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { boolFilterFn, listNotEmptyFilterFn, multiFilterFn, rangeFilterFn } from '@evm-ui/shared/ui/DataTable/filters'
import { MarketRateType } from '@evm-ui/types/market'
import type { DeepKeys } from '@tanstack/table-core'
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

const columnHelper = createAppColumnHelper<LlamaMarketRow>()

/** Define a hidden column. */
const hidden = (id: MarketColumnId, field: DeepKeys<LlamaMarketRow>, filterFn: typeof multiFilterFn) =>
  columnHelper.accessor(field, {
    id,
    header: MARKET_TITLES[id],
    filterFn,
    meta: { hidden: true },
  })

/** Columns for the lending markets table. */
export const MARKET_COLUMNS = columnHelper.columns([
  columnHelper.accessor(
    ({ assets }) => `${assets.collateral.symbol.toLowerCase()}•${assets.borrowed.symbol.toLowerCase()}`,
    {
      id: MarketColumnId.Assets,
      header: MARKET_TITLES[MarketColumnId.Assets],
      cell: MarketTitleCell,
      meta: {
        tooltip: { title: MARKET_TITLES[MarketColumnId.Assets], body: <CollateralBorrowHeaderTooltipContent /> },
      },
    },
  ),
  columnHelper.accessor(getUserBorrowedUsd, {
    id: MarketColumnId.UserBorrowed,
    header: MARKET_TITLES[MarketColumnId.UserBorrowed],
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(getUserCollateralUsd, {
    id: MarketColumnId.UserCollateral,
    header: MARKET_TITLES[MarketColumnId.UserCollateral],
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('lendingPosition.earnings', {
    id: MarketColumnId.UserEarnings,
    header: MARKET_TITLES[MarketColumnId.UserEarnings],
    cell: PriceCell,
    meta: { type: 'numeric', hidden: true }, // hidden until we have a backend
    sortUndefined: 'last',
  }),
  columnHelper.accessor('lendingPosition.supplied', {
    id: MarketColumnId.UserDeposited,
    header: MARKET_TITLES[MarketColumnId.UserDeposited],
    cell: PriceCell,
    meta: { type: 'numeric' },
    filterFn: boolFilterFn,
    sortUndefined: 'last',
  }),
  columnHelper.accessor('lendingPosition.boostMultiplier', {
    id: MarketColumnId.UserBoostMultiplier,
    header: MARKET_TITLES[MarketColumnId.UserBoostMultiplier],
    cell: BoostCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrowApr', {
    id: MarketColumnId.BorrowRate,
    header: MARKET_TITLES[MarketColumnId.BorrowRate],
    cell: RateCell,
    meta: {
      type: 'numeric',
      unit: 'percentage',
    },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor('rates.borrowTotalApr', {
    id: MarketColumnId.NetBorrowRate,
    header: MARKET_TITLES[MarketColumnId.NetBorrowRate],
    cell: RateCell,
    meta: {
      type: 'numeric',
      tooltip: { title: MARKET_TITLES[MarketColumnId.NetBorrowRate], body: <NetBorrowAprHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(getUserPositionLtv, {
    id: MarketColumnId.UserLtv,
    header: MARKET_TITLES[MarketColumnId.UserLtv],
    cell: LtvCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(getUserPositionHealth, {
    id: MarketColumnId.UserHealth,
    header: MARKET_TITLES[MarketColumnId.UserHealth],
    cell: HealthCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.lendTotalApyMinBoosted', {
    id: MarketColumnId.LendRate,
    header: MARKET_TITLES[MarketColumnId.LendRate],
    cell: RateCell,
    meta: {
      type: 'numeric',
      tooltip: { title: MARKET_TITLES[MarketColumnId.LendRate], body: <LendRateHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrowApr', {
    id: MarketColumnId.BorrowChart,
    header: MARKET_TITLES[MarketColumnId.BorrowChart],
    cell: c => <LineGraphCell market={c.row.original} type={MarketRateType.Borrow} />,
  }),
  columnHelper.accessor<(row: LlamaMarketRow) => LlamaMarketRow['leverage'], LlamaMarketRow['leverage']>(
    row => row.leverage,
    {
      id: MarketColumnId.MaxLeverage,
      header: MARKET_TITLES[MarketColumnId.MaxLeverage],
      cell: MaxLeverageCell,
      meta: { type: 'numeric' },
      sortUndefined: 'last',
    },
  ),
  columnHelper.accessor('maxLtv', {
    id: MarketColumnId.MaxLtv,
    header: MARKET_TITLES[MarketColumnId.MaxLtv],
    cell: PercentCell,
    meta: { type: 'numeric', unit: 'percentage' },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor('utilizationPercent', {
    id: MarketColumnId.UtilizationPercent,
    header: MARKET_TITLES[MarketColumnId.UtilizationPercent],
    cell: UtilizationCell,
    meta: {
      type: 'numeric',
      unit: 'percentage',
      tooltip: { title: MARKET_TITLES[MarketColumnId.UtilizationPercent], body: <UtilizationHeaderTooltipContent /> },
    },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor(
    // Normalize null to undefined so sortUndefined places missing solvency values last
    ({ solvencyPercent }) => solvencyPercent ?? undefined,
    {
      id: MarketColumnId.SolvencyPercent,
      header: MARKET_TITLES[MarketColumnId.SolvencyPercent],
      cell: SolvencyCell,
      meta: {
        type: 'numeric',
        unit: 'percentage',
        tooltip: { title: MARKET_TITLES[MarketColumnId.SolvencyPercent], body: <SolvencyTooltip type="overview" /> },
      },
      sortUndefined: 'last',
    },
  ),
  columnHelper.accessor('liquidityUsd', {
    id: MarketColumnId.LiquidityUsd,
    header: MARKET_TITLES[MarketColumnId.LiquidityUsd],
    cell: LiquidityUsdCell,
    meta: {
      type: 'numeric',
      unit: 'dollar',
      tooltip: { title: MARKET_TITLES[MarketColumnId.LiquidityUsd], body: <LiquidityUsdHeaderTooltipContent /> },
    },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor('totalDebtUsd', {
    id: MarketColumnId.TotalDebt,
    header: MARKET_TITLES[MarketColumnId.TotalDebt],
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('totalCollateralUsd', {
    id: MarketColumnId.TotalCollateralUsd,
    header: MARKET_TITLES[MarketColumnId.TotalCollateralUsd],
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('tvl', {
    id: MarketColumnId.Tvl,
    header: MARKET_TITLES[MarketColumnId.Tvl],
    cell: TvlCell,
    meta: {
      type: 'numeric',
      unit: 'dollar',
      tooltip: { title: MARKET_TITLES[MarketColumnId.Tvl], body: <TvlHeaderTooltipContent /> },
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
])
