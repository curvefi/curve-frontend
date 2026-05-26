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
  CollateralBorrowHeaderTooltipContent,
  LendRateHeaderTooltipContent,
  LiquidityUsdHeaderTooltipContent,
  NetBorrowAprHeaderTooltipContent,
  TvlHeaderTooltipContent,
  UtilizationHeaderTooltipContent,
} from '../header-tooltips'
import { LlamaMarketColumnId } from './columns.enum'

type Tooltip = ColumnMeta<never, never>['tooltip']
type LlamaColumn = ColumnDefinition<LlamaMarket>

const columnHelper = createColumnHelper<LlamaMarket>()

const createTooltip = (id: keyof typeof LLAMA_MARKET_TITLES, body: ReactNode): Tooltip => ({
  title: LLAMA_MARKET_TITLES[id],
  body,
})

/** Define a hidden column. */
const hidden = (field: DeepKeys<LlamaMarket>, id: LlamaMarketColumnId, filterFn: FilterFnOption<LlamaMarket>) =>
  columnHelper.accessor(field, {
    id,
    filterFn,
    header: LLAMA_MARKET_TITLES[id],
    meta: { hidden: true },
  })

export const LLAMA_MARKET_TITLES: Record<LlamaMarketColumnId, string> = {
  [LlamaMarketColumnId.BorrowedSymbol]: t`Debt`,
  [LlamaMarketColumnId.CollateralSymbol]: t`Collateral`,
  [LlamaMarketColumnId.DeprecatedMessage]: t`Deprecated Message`,
  [LlamaMarketColumnId.Version]: t`Market Version`,
  [LlamaMarketColumnId.Type]: t`Market Type`,
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
  [LlamaMarketColumnId.NetBorrowRate]: t`Net Borrow APR`,
  [LlamaMarketColumnId.LendRate]: NET_SUPPLY_RATE_TITLE,
  [LlamaMarketColumnId.BorrowChart]: t`${AVERAGE_CATEGORIES['llamalend.marketList.rate'].period} Borrow APR`,
  [LlamaMarketColumnId.MaxLtv]: t`Max LTV`,
  [LlamaMarketColumnId.MaxLeverage]: t`Max Leverage`,
  [LlamaMarketColumnId.UtilizationPercent]: t`Utilization`,
  [LlamaMarketColumnId.LiquidityUsd]: t`Available Liquidity`,
  [LlamaMarketColumnId.Tvl]: t`TVL`,
  [LlamaMarketColumnId.TotalDebt]: t`Total Debt`,
  [LlamaMarketColumnId.TotalCollateralUsd]: t`Total Collateral`,
} as const

/** Columns for the lending markets table. */
export const LLAMA_MARKET_COLUMNS = [
  columnHelper.accessor(LlamaMarketColumnId.Assets, {
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.Assets],
    cell: MarketTitleCell,
    meta: { tooltip: createTooltip(LlamaMarketColumnId.Assets, <CollateralBorrowHeaderTooltipContent />) },
  }),
  {
    id: LlamaMarketColumnId.UserBorrowed,
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.UserBorrowed],
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  },
  {
    id: LlamaMarketColumnId.UserCollateral,
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.UserCollateral],
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  },
  {
    id: LlamaMarketColumnId.UserEarnings,
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.UserEarnings],
    cell: PriceCell,
    meta: { type: 'numeric', hidden: true }, // hidden until we have a backend
    sortUndefined: 'last',
  },
  {
    id: LlamaMarketColumnId.UserDeposited,
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.UserDeposited],
    cell: PriceCell,
    meta: { type: 'numeric' },
    filterFn: boolFilterFn,
    sortUndefined: 'last',
  },
  {
    id: LlamaMarketColumnId.UserBoostMultiplier,
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.UserBoostMultiplier],
    cell: BoostCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  },
  columnHelper.accessor('rates.borrowApr', {
    id: LlamaMarketColumnId.BorrowRate,
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.BorrowRate],
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
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.NetBorrowRate],
    cell: RateCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(LlamaMarketColumnId.NetBorrowRate, <NetBorrowAprHeaderTooltipContent />),
    },
    sortUndefined: 'last',
  }),
  {
    id: LlamaMarketColumnId.UserLtv,
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.UserLtv],
    cell: LtvCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  },
  {
    id: LlamaMarketColumnId.UserHealth,
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.UserHealth],
    cell: HealthCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  },
  columnHelper.accessor('rates.lendTotalApyMinBoosted', {
    id: LlamaMarketColumnId.LendRate,
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.LendRate],
    cell: RateCell,
    meta: { type: 'numeric', tooltip: createTooltip(LlamaMarketColumnId.LendRate, <LendRateHeaderTooltipContent />) },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrowApr', {
    id: LlamaMarketColumnId.BorrowChart,
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.BorrowChart],
    cell: c => <LineGraphCell market={c.row.original} type={MarketRateType.Borrow} />,
  }),
  columnHelper.accessor('leverage', {
    id: LlamaMarketColumnId.MaxLeverage,
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.MaxLeverage],
    cell: MaxLeverageCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.MaxLtv, {
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.MaxLtv],
    cell: PercentCell,
    meta: { type: 'numeric', unit: 'percentage' },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor(LlamaMarketColumnId.UtilizationPercent, {
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.UtilizationPercent],
    cell: UtilizationCell,
    meta: {
      type: 'numeric',
      unit: 'percentage',
      tooltip: createTooltip(LlamaMarketColumnId.UtilizationPercent, <UtilizationHeaderTooltipContent />),
    },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor(LlamaMarketColumnId.LiquidityUsd, {
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.LiquidityUsd],
    cell: LiquidityUsdCell,
    meta: {
      type: 'numeric',
      unit: 'dollar',
      tooltip: createTooltip(LlamaMarketColumnId.LiquidityUsd, <LiquidityUsdHeaderTooltipContent />),
    },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor(LlamaMarketColumnId.TotalDebt, {
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.TotalDebt],
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.TotalCollateralUsd, {
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.TotalCollateralUsd],
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.Tvl, {
    header: LLAMA_MARKET_TITLES[LlamaMarketColumnId.Tvl],
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
