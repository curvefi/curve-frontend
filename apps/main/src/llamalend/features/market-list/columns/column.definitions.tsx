import { ReactNode } from 'react'
import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { SolvencyTooltip } from '@/llamalend/widgets/tooltips'
import { type ColumnMeta, createColumnHelper, FilterFnOption } from '@tanstack/react-table'
import { type AccessorFn, type DeepKeys } from '@tanstack/table-core'
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
import { MarketColumnId } from './columns.enum'

type Tooltip = ColumnMeta<never, never>['tooltip']
type MarketColumn = ColumnDefinition<LlamaMarket>
type MarketColumnOptions = Omit<MarketColumn, 'id' | 'header'>
type MarketAccessor = DeepKeys<LlamaMarket> | AccessorFn<LlamaMarket>

const createTooltip = (id: keyof typeof MARKET_TITLES, body: ReactNode): Tooltip => ({
  title: MARKET_TITLES[id],
  body,
})

/** Define a display column using its id as the title lookup key. */
const display = (id: MarketColumnId, column: MarketColumnOptions): MarketColumn => ({
  ...column,
  id,
  header: MARKET_TITLES[id],
})

/** Define an accessor column using separate data and table identifiers. */
const accessor = (id: MarketColumnId, field: MarketAccessor, column: MarketColumnOptions): MarketColumn =>
  createColumnHelper<LlamaMarket>().accessor(field, {
    ...column,
    id,
    header: MARKET_TITLES[id],
  })

/** Define a hidden column. */
const hidden = (id: MarketColumnId, field: DeepKeys<LlamaMarket>, filterFn: FilterFnOption<LlamaMarket>) =>
  accessor(id, field, {
    filterFn,
    meta: { hidden: true },
  })

/** Titles for the lending markets table. */
export const MARKET_TITLES: Record<MarketColumnId, string> = {
  [MarketColumnId.BorrowedSymbol]: t`Debt`,
  [MarketColumnId.CollateralSymbol]: t`Collateral`,
  [MarketColumnId.DeprecatedMessage]: t`Deprecated Message`,
  [MarketColumnId.Version]: t`Market Version`,
  [MarketColumnId.Type]: t`Market Type`,
  [MarketColumnId.Rewards]: t`Rewards`,
  [MarketColumnId.IsFavorite]: t`Favorites`,
  [MarketColumnId.Chain]: t`Network`,
  [MarketColumnId.Assets]: t`Collateral • Borrow`,
  [MarketColumnId.UserHealth]: t`Health`,
  [MarketColumnId.UserBorrowed]: t`Borrow Amount`,
  [MarketColumnId.UserCollateral]: t`Collateral Amount`,
  [MarketColumnId.UserLtv]: t`LTV`,
  [MarketColumnId.UserBoostMultiplier]: t`Boost`,
  [MarketColumnId.UserEarnings]: t`My Earnings`,
  [MarketColumnId.UserDeposited]: t`Supplied Amount`,
  [MarketColumnId.BorrowRate]: t`Borrow APR`,
  [MarketColumnId.NetBorrowRate]: t`Net Borrow APR`,
  [MarketColumnId.LendRate]: NET_SUPPLY_RATE_TITLE,
  [MarketColumnId.BorrowChart]: t`${AVERAGE_CATEGORIES['llamalend.marketList.rate'].period} Borrow APR`,
  [MarketColumnId.MaxLtv]: t`Max LTV`,
  [MarketColumnId.MaxLeverage]: t`Max Leverage`,
  [MarketColumnId.UtilizationPercent]: t`Utilization`,
  [MarketColumnId.SolvencyPercent]: t`Solvency`,
  [MarketColumnId.LiquidityUsd]: t`Available Liquidity`,
  [MarketColumnId.Tvl]: t`TVL`,
  [MarketColumnId.TotalDebt]: t`Total Debt`,
  [MarketColumnId.TotalCollateralUsd]: t`Total Collateral`,
} as const

/** Columns for the lending markets table. */
export const MARKET_COLUMNS = [
  accessor(MarketColumnId.Assets, MarketColumnId.Assets, {
    cell: MarketTitleCell,
    meta: { tooltip: createTooltip(MarketColumnId.Assets, <CollateralBorrowHeaderTooltipContent />) },
  }),
  display(MarketColumnId.UserBorrowed, {
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  display(MarketColumnId.UserCollateral, {
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
  display(MarketColumnId.UserLtv, {
    cell: LtvCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  display(MarketColumnId.UserHealth, {
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
