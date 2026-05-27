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
type LlamaColumnOptions = Omit<LlamaColumn, 'id' | 'header'>

const createTooltip = (id: keyof typeof LLAMA_MARKET_TITLES, body: ReactNode): Tooltip => ({
  title: LLAMA_MARKET_TITLES[id],
  body,
})

/** Define a display column using its id as the title lookup key. */
const display = (id: LlamaMarketColumnId, column: LlamaColumnOptions): LlamaColumn => ({
  ...column,
  id,
  header: LLAMA_MARKET_TITLES[id],
})

/** Define an accessor column using separate data and table identifiers. */
const accessor = (id: LlamaMarketColumnId, field: DeepKeys<LlamaMarket>, column: LlamaColumnOptions): LlamaColumn =>
  createColumnHelper<LlamaMarket>().accessor(field, {
    ...column,
    id,
    header: LLAMA_MARKET_TITLES[id],
  })

/** Define a hidden column. */
const hidden = (id: LlamaMarketColumnId, field: DeepKeys<LlamaMarket>, filterFn: FilterFnOption<LlamaMarket>) =>
  accessor(id, field, {
    filterFn,
    meta: { hidden: true },
  })

/** Titles for the lending markets table. */
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
  accessor(LlamaMarketColumnId.Assets, LlamaMarketColumnId.Assets, {
    cell: MarketTitleCell,
    meta: { tooltip: createTooltip(LlamaMarketColumnId.Assets, <CollateralBorrowHeaderTooltipContent />) },
  }),
  display(LlamaMarketColumnId.UserBorrowed, {
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  display(LlamaMarketColumnId.UserCollateral, {
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  display(LlamaMarketColumnId.UserEarnings, {
    cell: PriceCell,
    meta: { type: 'numeric', hidden: true }, // hidden until we have a backend
    sortUndefined: 'last',
  }),
  display(LlamaMarketColumnId.UserDeposited, {
    cell: PriceCell,
    meta: { type: 'numeric' },
    filterFn: boolFilterFn,
    sortUndefined: 'last',
  }),
  display(LlamaMarketColumnId.UserBoostMultiplier, {
    cell: BoostCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(LlamaMarketColumnId.BorrowRate, 'rates.borrowApr', {
    cell: RateCell,
    meta: {
      type: 'numeric',
      unit: 'percentage',
    },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  accessor(LlamaMarketColumnId.NetBorrowRate, 'rates.borrowTotalApr', {
    cell: RateCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(LlamaMarketColumnId.NetBorrowRate, <NetBorrowAprHeaderTooltipContent />),
    },
    sortUndefined: 'last',
  }),
  display(LlamaMarketColumnId.UserLtv, {
    cell: LtvCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  display(LlamaMarketColumnId.UserHealth, {
    cell: HealthCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(LlamaMarketColumnId.LendRate, 'rates.lendTotalApyMinBoosted', {
    cell: RateCell,
    meta: { type: 'numeric', tooltip: createTooltip(LlamaMarketColumnId.LendRate, <LendRateHeaderTooltipContent />) },
    sortUndefined: 'last',
  }),
  accessor(LlamaMarketColumnId.BorrowChart, 'rates.borrowApr', {
    cell: c => <LineGraphCell market={c.row.original} type={MarketRateType.Borrow} />,
  }),
  accessor(LlamaMarketColumnId.MaxLeverage, 'leverage', {
    cell: MaxLeverageCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(LlamaMarketColumnId.MaxLtv, LlamaMarketColumnId.MaxLtv, {
    cell: PercentCell,
    meta: { type: 'numeric', unit: 'percentage' },
    filterFn: rangeFilterFn,
  }),
  accessor(LlamaMarketColumnId.UtilizationPercent, LlamaMarketColumnId.UtilizationPercent, {
    cell: UtilizationCell,
    meta: {
      type: 'numeric',
      unit: 'percentage',
      tooltip: createTooltip(LlamaMarketColumnId.UtilizationPercent, <UtilizationHeaderTooltipContent />),
    },
    filterFn: rangeFilterFn,
  }),
  accessor(LlamaMarketColumnId.LiquidityUsd, LlamaMarketColumnId.LiquidityUsd, {
    cell: LiquidityUsdCell,
    meta: {
      type: 'numeric',
      unit: 'dollar',
      tooltip: createTooltip(LlamaMarketColumnId.LiquidityUsd, <LiquidityUsdHeaderTooltipContent />),
    },
    filterFn: rangeFilterFn,
  }),
  accessor(LlamaMarketColumnId.TotalDebt, LlamaMarketColumnId.TotalDebt, {
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(LlamaMarketColumnId.TotalCollateralUsd, LlamaMarketColumnId.TotalCollateralUsd, {
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(LlamaMarketColumnId.Tvl, LlamaMarketColumnId.Tvl, {
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
  hidden(LlamaMarketColumnId.CollateralSymbol, 'assets.collateral.symbol', multiFilterFn),
  hidden(LlamaMarketColumnId.BorrowedSymbol, 'assets.borrowed.symbol', multiFilterFn),
  hidden(LlamaMarketColumnId.IsFavorite, LlamaMarketColumnId.IsFavorite, boolFilterFn),
  hidden(LlamaMarketColumnId.Rewards, LlamaMarketColumnId.Rewards, listNotEmptyFilterFn),
  hidden(LlamaMarketColumnId.DeprecatedMessage, LlamaMarketColumnId.DeprecatedMessage, boolFilterFn),
  hidden(LlamaMarketColumnId.Type, LlamaMarketColumnId.Type, multiFilterFn),
  hidden(LlamaMarketColumnId.Version, LlamaMarketColumnId.Version, multiFilterFn),
] satisfies LlamaColumn[]
