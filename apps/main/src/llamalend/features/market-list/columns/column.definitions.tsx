import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { getMaxReturnOnEquity } from '@/llamalend/rates.utils'
import { MaxReturnOnEquityTooltipContent, SolvencyTooltip } from '@/llamalend/widgets/tooltips'
import { MarketRateType } from '@evm-ui/types/market'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import { boolFilterFn, listNotEmptyFilterFn, multiFilterFn, rangeFilterFn } from '@ui/features/tables/filters'
import { BoostCell } from '../cells/BoostCell'
import { CompactUsdCell } from '../cells/CompactUsdCell'
import { HealthCell } from '../cells/HealthCell'
import { LineGraphCell } from '../cells/LineGraphCell'
import { LiquidityUsdCell } from '../cells/LiquidityUsdCell'
import { LtvCell } from '../cells/LtvCell'
import { MarketTitleCell } from '../cells/MarketTitleCell'
import { MaxLeverageCell } from '../cells/MaxLeverageCell'
import { MaxReturnOnEquityCell } from '../cells/MaxReturnOnEquityCell'
import { PercentCell } from '../cells/PercentCell'
import { PriceCell } from '../cells/PriceCell'
import { RateCell } from '../cells/RateCell/RateCell'
import { SolvencyCell } from '../cells/SolvencyCell'
import { TvlCell } from '../cells/TvlCell'
import { UtilizationCell } from '../cells/UtilizationCell'
import { CollateralBorrowHeaderTooltipContent } from '../header-tooltips/CollateralBorrowHeaderTooltipContent'
import { LendRateHeaderTooltipContent } from '../header-tooltips/LendRateHeaderTooltipContent'
import { LiquidityUsdHeaderTooltipContent } from '../header-tooltips/LiquidityUsdHeaderTooltipContent'
import { NetBorrowAprHeaderTooltipContent } from '../header-tooltips/NetBorrowAprHeaderTooltipContent'
import { TvlHeaderTooltipContent } from '../header-tooltips/TvlHeaderTooltipContent'
import { UtilizationHeaderTooltipContent } from '../header-tooltips/UtilizationHeaderTooltipContent'
import {
  getUserBorrowedUsd,
  getUserCollateralUsd,
  getUserPositionHealth,
  getUserPositionLtv,
} from '../user-position.utils'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'

const columnHelper = createAppColumnHelper<LlamaMarketRow>()

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
    meta: { type: 'numeric' },
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
    meta: { type: 'numeric', unit: 'percentage' },
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
  columnHelper.accessor(getMaxReturnOnEquity, {
    id: MarketColumnId.MaxReturnOnEquity,
    header: MARKET_TITLES[MarketColumnId.MaxReturnOnEquity],
    cell: MaxReturnOnEquityCell,
    meta: {
      type: 'numeric',
      unit: 'percentage',
      tooltip: { title: MARKET_TITLES[MarketColumnId.MaxReturnOnEquity], body: <MaxReturnOnEquityTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(row => row.maxLtv ?? undefined, {
    id: MarketColumnId.MaxLtv,
    header: MARKET_TITLES[MarketColumnId.MaxLtv],
    cell: PercentCell,
    meta: { type: 'numeric', unit: 'percentage' },
    filterFn: rangeFilterFn,
    sortUndefined: 'last',
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
  // The following columns are at the moment of writing used for filtering only and most likely hidden.
  columnHelper.accessor('blockchainId', { id: MarketColumnId.Chain, filterFn: multiFilterFn }),
  columnHelper.accessor('assets.collateral.symbol', { id: MarketColumnId.CollateralSymbol, filterFn: multiFilterFn }),
  columnHelper.accessor('assets.borrowed.symbol', { id: MarketColumnId.BorrowedSymbol, filterFn: multiFilterFn }),
  columnHelper.accessor('isFavorite', { id: MarketColumnId.IsFavorite, filterFn: boolFilterFn }),
  columnHelper.accessor('rewards', { id: MarketColumnId.Rewards, filterFn: listNotEmptyFilterFn }),
  columnHelper.accessor('deprecatedMessage', { id: MarketColumnId.DeprecatedMessage, filterFn: boolFilterFn }),
  columnHelper.accessor('type', { id: MarketColumnId.Type, filterFn: multiFilterFn }),
  columnHelper.accessor('version', { id: MarketColumnId.Version, filterFn: multiFilterFn }),
])
