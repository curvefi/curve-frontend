import { useMemo } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { getCampaignAprs, getSupplyRateMetrics } from '@/llamalend/rates.utils'
import { SolvencyTooltip } from '@/llamalend/widgets/tooltips'
import { useAprToApy } from '@evm-ui/hooks/useAprToApy'
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
import { useMarketTitles } from './column.titles'
import { MarketColumnId } from './columns.enum'

const columnHelper = createAppColumnHelper<LlamaMarketRow>()

/** Define a hidden column. */
const hidden = (
  marketTitles: Record<MarketColumnId, string>,
  id: MarketColumnId,
  field: DeepKeys<LlamaMarketRow>,
  filterFn: typeof multiFilterFn,
) =>
  columnHelper.accessor(field, {
    id,
    header: marketTitles[id],
    filterFn,
    meta: { hidden: true },
  })

/** Columns for the lending markets table. */
const createMarketColumns = (
  marketTitles: Record<MarketColumnId, string>,
  convertRate: ReturnType<typeof useAprToApy>,
) => columnHelper.columns([
  columnHelper.accessor(
    ({ assets }) => `${assets.collateral.symbol.toLowerCase()}•${assets.borrowed.symbol.toLowerCase()}`,
    {
      id: MarketColumnId.Assets,
      header: marketTitles[MarketColumnId.Assets],
      cell: MarketTitleCell,
      meta: {
        tooltip: { title: marketTitles[MarketColumnId.Assets], body: <CollateralBorrowHeaderTooltipContent /> },
      },
    },
  ),
  columnHelper.accessor(getUserBorrowedUsd, {
    id: MarketColumnId.UserBorrowed,
    header: marketTitles[MarketColumnId.UserBorrowed],
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(getUserCollateralUsd, {
    id: MarketColumnId.UserCollateral,
    header: marketTitles[MarketColumnId.UserCollateral],
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('lendingPosition.earnings', {
    id: MarketColumnId.UserEarnings,
    header: marketTitles[MarketColumnId.UserEarnings],
    cell: PriceCell,
    meta: { type: 'numeric', hidden: true }, // hidden until we have a backend
    sortUndefined: 'last',
  }),
  columnHelper.accessor('lendingPosition.supplied', {
    id: MarketColumnId.UserDeposited,
    header: marketTitles[MarketColumnId.UserDeposited],
    cell: PriceCell,
    meta: { type: 'numeric' },
    filterFn: boolFilterFn,
    sortUndefined: 'last',
  }),
  columnHelper.accessor('lendingPosition.boostMultiplier', {
    id: MarketColumnId.UserBoostMultiplier,
    header: marketTitles[MarketColumnId.UserBoostMultiplier],
    cell: BoostCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrowApr', {
    id: MarketColumnId.BorrowRate,
    header: marketTitles[MarketColumnId.BorrowRate],
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
    header: marketTitles[MarketColumnId.NetBorrowRate],
    cell: RateCell,
    meta: {
      type: 'numeric',
      tooltip: { title: marketTitles[MarketColumnId.NetBorrowRate], body: <NetBorrowAprHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(getUserPositionLtv, {
    id: MarketColumnId.UserLtv,
    header: marketTitles[MarketColumnId.UserLtv],
    cell: LtvCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(getUserPositionHealth, {
    id: MarketColumnId.UserHealth,
    header: marketTitles[MarketColumnId.UserHealth],
    cell: HealthCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(({ assets, rates, rewards }) => getSupplyRateMetrics({
    supplyApr: rates.lendApr,
    crvBoostApr: [rates.lendCrvAprUnboosted, rates.lendCrvAprBoosted],
    rebasingYieldApr: assets.borrowed.rebasingYieldApr,
    extraIncentivesApr: rates.incentives.map(incentive => incentive.percentage),
    campaignsApr: getCampaignAprs(rewards.filter(reward => reward.action === 'supply')),
    convertRate,
  }).totalMinBoost, {
    id: MarketColumnId.LendRate,
    header: marketTitles[MarketColumnId.LendRate],
    cell: RateCell,
    meta: {
      type: 'numeric',
      tooltip: { title: marketTitles[MarketColumnId.LendRate], body: <LendRateHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrowApr', {
    id: MarketColumnId.BorrowChart,
    header: marketTitles[MarketColumnId.BorrowChart],
    cell: c => <LineGraphCell market={c.row.original} type={MarketRateType.Borrow} />,
  }),
  columnHelper.accessor<(row: LlamaMarketRow) => LlamaMarketRow['leverage'], LlamaMarketRow['leverage']>(
    row => row.leverage,
    {
      id: MarketColumnId.MaxLeverage,
      header: marketTitles[MarketColumnId.MaxLeverage],
      cell: MaxLeverageCell,
      meta: { type: 'numeric' },
      sortUndefined: 'last',
    },
  ),
  columnHelper.accessor('maxLtv', {
    id: MarketColumnId.MaxLtv,
    header: marketTitles[MarketColumnId.MaxLtv],
    cell: PercentCell,
    meta: { type: 'numeric', unit: 'percentage' },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor('utilizationPercent', {
    id: MarketColumnId.UtilizationPercent,
    header: marketTitles[MarketColumnId.UtilizationPercent],
    cell: UtilizationCell,
    meta: {
      type: 'numeric',
      unit: 'percentage',
      tooltip: { title: marketTitles[MarketColumnId.UtilizationPercent], body: <UtilizationHeaderTooltipContent /> },
    },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor(
    // Normalize null to undefined so sortUndefined places missing solvency values last
    ({ solvencyPercent }) => solvencyPercent ?? undefined,
    {
      id: MarketColumnId.SolvencyPercent,
      header: marketTitles[MarketColumnId.SolvencyPercent],
      cell: SolvencyCell,
      meta: {
        type: 'numeric',
        unit: 'percentage',
        tooltip: { title: marketTitles[MarketColumnId.SolvencyPercent], body: <SolvencyTooltip type="overview" /> },
      },
      sortUndefined: 'last',
    },
  ),
  columnHelper.accessor('liquidityUsd', {
    id: MarketColumnId.LiquidityUsd,
    header: marketTitles[MarketColumnId.LiquidityUsd],
    cell: LiquidityUsdCell,
    meta: {
      type: 'numeric',
      unit: 'dollar',
      tooltip: { title: marketTitles[MarketColumnId.LiquidityUsd], body: <LiquidityUsdHeaderTooltipContent /> },
    },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor('totalDebtUsd', {
    id: MarketColumnId.TotalDebt,
    header: marketTitles[MarketColumnId.TotalDebt],
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('totalCollateralUsd', {
    id: MarketColumnId.TotalCollateralUsd,
    header: marketTitles[MarketColumnId.TotalCollateralUsd],
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('tvl', {
    id: MarketColumnId.Tvl,
    header: marketTitles[MarketColumnId.Tvl],
    cell: TvlCell,
    meta: {
      type: 'numeric',
      unit: 'dollar',
      tooltip: { title: marketTitles[MarketColumnId.Tvl], body: <TvlHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  // Following columns are used in tanstack filter, but they are displayed together in MarketTitleCell
  hidden(marketTitles, MarketColumnId.Chain, MarketColumnId.Chain, multiFilterFn),
  hidden(marketTitles, MarketColumnId.CollateralSymbol, 'assets.collateral.symbol', multiFilterFn),
  hidden(marketTitles, MarketColumnId.BorrowedSymbol, 'assets.borrowed.symbol', multiFilterFn),
  hidden(marketTitles, MarketColumnId.IsFavorite, MarketColumnId.IsFavorite, boolFilterFn),
  hidden(marketTitles, MarketColumnId.Rewards, MarketColumnId.Rewards, listNotEmptyFilterFn),
  hidden(marketTitles, MarketColumnId.DeprecatedMessage, MarketColumnId.DeprecatedMessage, boolFilterFn),
  hidden(marketTitles, MarketColumnId.Type, MarketColumnId.Type, multiFilterFn),
  hidden(marketTitles, MarketColumnId.Version, MarketColumnId.Version, multiFilterFn),
])

export const useMarketColumns = () => {
  const marketTitles = useMarketTitles()
  const convertRate = useAprToApy()
  return useMemo(() => createMarketColumns(marketTitles, convertRate), [convertRate, marketTitles])
}
