import { ReactNode } from 'react'
import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { type ColumnMeta, createColumnHelper, FilterFnOption } from '@tanstack/react-table'
import { type DeepKeys } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import type { ColumnDefinition } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { boolFilterFn, listNotEmptyFilterFn, multiFilterFn, rangeFilterFn } from '@ui-kit/shared/ui/DataTable/filters'
import { MarketRateType } from '@ui-kit/types/market'
import { AVERAGE_CATEGORIES } from '@ui-kit/utils'
import { LlamaMarket } from '../../../queries/market-list/llama-markets'
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
  TvlCell,
  UtilizationCell,
} from '../cells'
import {
  NetBorrowAprHeaderTooltipContent,
  CollateralBorrowHeaderTooltipContent,
  LendRateHeaderTooltipContent,
  LiquidityUsdHeaderTooltipContent,
  TvlHeaderTooltipContent,
  UtilizationHeaderTooltipContent,
} from '../header-tooltips'
import { LlamaMarketColumnId } from './columns.enum'

const columnHelper = createColumnHelper<LlamaMarket>()

const titles: Record<LlamaMarketColumnId, string> = {
  [LlamaMarketColumnId.BorrowedSymbol]: t`Borrowed symbol`,
  [LlamaMarketColumnId.CollateralSymbol]: t`Collateral symbol`,
  [LlamaMarketColumnId.DeprecatedMessage]: t`Deprecated message`,
  [LlamaMarketColumnId.Version]: t`Market version`,
  [LlamaMarketColumnId.Type]: t`Market type`,
  [LlamaMarketColumnId.Rewards]: t`Rewards`,
  [LlamaMarketColumnId.IsFavorite]: t`Favorites`,
  [LlamaMarketColumnId.Chain]: t`Network`,
  [LlamaMarketColumnId.Assets]: t`Collateral • Borrow`,
  [LlamaMarketColumnId.UserHealth]: t`Health`,
  [LlamaMarketColumnId.UserBorrowed]: t`Borrow Amount`,
  [LlamaMarketColumnId.UserCollateral]: t`Collateral Amount`,
  [LlamaMarketColumnId.UserLtv]: t`LTV`,
  [LlamaMarketColumnId.UserBoostMultiplier]: t`Boost`,
  [LlamaMarketColumnId.UserEarnings]: t`My Earnings`,
  [LlamaMarketColumnId.UserDeposited]: t`Supplied Amount`,
  [LlamaMarketColumnId.BorrowRate]: t`Borrow APR`,
  [LlamaMarketColumnId.NetBorrowRate]: t`Net borrow APR`,
  [LlamaMarketColumnId.LendRate]: NET_SUPPLY_RATE_TITLE,
  [LlamaMarketColumnId.BorrowChart]: t`${AVERAGE_CATEGORIES['llamalend.marketList.rate'].period} borrow APR`,
  [LlamaMarketColumnId.MaxLtv]: t`Max LTV`,
  [LlamaMarketColumnId.MaxLeverage]: t`Max leverage`,
  [LlamaMarketColumnId.UtilizationPercent]: t`Utilization`,
  [LlamaMarketColumnId.LiquidityUsd]: t`Available Liquidity`,
  [LlamaMarketColumnId.Tvl]: t`TVL`,
  [LlamaMarketColumnId.TotalDebt]: t`Total Debt`,
  [LlamaMarketColumnId.TotalCollateralUsd]: t`Total Collateral`,
} as const

type Tooltip = ColumnMeta<never, never>['tooltip']
const createTooltip = (id: keyof typeof titles, body: ReactNode): Tooltip => ({ title: titles[id], body })

/** Define a hidden column. */
const hidden = (field: DeepKeys<LlamaMarket>, id: LlamaMarketColumnId, filterFn: FilterFnOption<LlamaMarket>) =>
  columnHelper.accessor(field, {
    id,
    filterFn,
    header: titles[id],
    meta: { hidden: true },
  })

type LlamaColumn = ColumnDefinition<LlamaMarket>

/** Columns for the lending markets table. */
export const LLAMA_MARKET_COLUMNS = [
  columnHelper.accessor(LlamaMarketColumnId.Assets, {
    header: titles[LlamaMarketColumnId.Assets],
    cell: MarketTitleCell,
    meta: { tooltip: createTooltip(LlamaMarketColumnId.Assets, <CollateralBorrowHeaderTooltipContent />) },
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserBorrowed,
    header: titles[LlamaMarketColumnId.UserBorrowed],
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserCollateral,
    header: titles[LlamaMarketColumnId.UserCollateral],
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserEarnings,
    header: titles[LlamaMarketColumnId.UserEarnings],
    cell: PriceCell,
    meta: { type: 'numeric', hidden: true }, // hidden until we have a backend
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserDeposited,
    header: titles[LlamaMarketColumnId.UserDeposited],
    cell: PriceCell,
    meta: { type: 'numeric' },
    filterFn: boolFilterFn,
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserBoostMultiplier,
    header: titles[LlamaMarketColumnId.UserBoostMultiplier],
    cell: BoostCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrowApr', {
    id: LlamaMarketColumnId.BorrowRate,
    header: titles[LlamaMarketColumnId.BorrowRate],
    cell: RateCell,
    meta: {
      type: 'numeric',
      unit: 'percentage',
    },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor('rates.borrowTotalApr', {
    id: LlamaMarketColumnId.NetBorrowRate,
    header: titles[LlamaMarketColumnId.NetBorrowRate],
    cell: RateCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(LlamaMarketColumnId.NetBorrowRate, <NetBorrowAprHeaderTooltipContent />),
    },
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserLtv,
    header: titles[LlamaMarketColumnId.UserLtv],
    cell: LtvCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserHealth,
    header: titles[LlamaMarketColumnId.UserHealth],
    cell: HealthCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.lendTotalApyMinBoosted', {
    id: LlamaMarketColumnId.LendRate,
    header: titles[LlamaMarketColumnId.LendRate],
    cell: RateCell,
    meta: { type: 'numeric', tooltip: createTooltip(LlamaMarketColumnId.LendRate, <LendRateHeaderTooltipContent />) },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrowApr', {
    id: LlamaMarketColumnId.BorrowChart,
    header: titles[LlamaMarketColumnId.BorrowChart],
    cell: c => <LineGraphCell market={c.row.original} type={MarketRateType.Borrow} />,
  }),
  columnHelper.accessor('leverage', {
    id: LlamaMarketColumnId.MaxLeverage,
    header: titles[LlamaMarketColumnId.MaxLeverage],
    cell: MaxLeverageCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.MaxLtv, {
    header: titles[LlamaMarketColumnId.MaxLtv],
    cell: PercentCell,
    meta: { type: 'numeric', unit: 'percentage' },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor(LlamaMarketColumnId.UtilizationPercent, {
    header: titles[LlamaMarketColumnId.UtilizationPercent],
    cell: UtilizationCell,
    meta: {
      type: 'numeric',
      unit: 'percentage',
      tooltip: createTooltip(LlamaMarketColumnId.UtilizationPercent, <UtilizationHeaderTooltipContent />),
    },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor(LlamaMarketColumnId.LiquidityUsd, {
    header: titles[LlamaMarketColumnId.LiquidityUsd],
    cell: LiquidityUsdCell,
    meta: {
      type: 'numeric',
      unit: 'dollar',
      tooltip: createTooltip(LlamaMarketColumnId.LiquidityUsd, <LiquidityUsdHeaderTooltipContent />),
    },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor(LlamaMarketColumnId.TotalDebt, {
    header: titles[LlamaMarketColumnId.TotalDebt],
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.TotalCollateralUsd, {
    header: titles[LlamaMarketColumnId.TotalCollateralUsd],
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.Tvl, {
    header: titles[LlamaMarketColumnId.Tvl],
    cell: TvlCell,
    meta: {
      type: 'numeric',
      unit: 'dollar',
      tooltip: createTooltip(LlamaMarketColumnId.Tvl, <TvlHeaderTooltipContent />),
    },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  // Following columns are used in tanstack filter, but they are displayed together in MarketTitleCell
  hidden(LlamaMarketColumnId.Chain, LlamaMarketColumnId.Chain, multiFilterFn),
  hidden('assets.collateral.symbol', LlamaMarketColumnId.CollateralSymbol, multiFilterFn),
  hidden('assets.borrowed.symbol', LlamaMarketColumnId.BorrowedSymbol, multiFilterFn),
  hidden(LlamaMarketColumnId.IsFavorite, LlamaMarketColumnId.IsFavorite, boolFilterFn),
  hidden(LlamaMarketColumnId.Rewards, LlamaMarketColumnId.Rewards, listNotEmptyFilterFn),
  hidden(LlamaMarketColumnId.DeprecatedMessage, LlamaMarketColumnId.DeprecatedMessage, boolFilterFn),
  hidden(LlamaMarketColumnId.Type, LlamaMarketColumnId.Type, multiFilterFn),
  hidden(LlamaMarketColumnId.Version, LlamaMarketColumnId.Version, multiFilterFn),
] satisfies LlamaColumn[]
