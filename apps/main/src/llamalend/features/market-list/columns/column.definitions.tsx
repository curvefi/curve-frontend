import { ReactNode } from 'react'
import { ColumnDef, type ColumnMeta, createColumnHelper, FilterFnOption } from '@tanstack/react-table'
import { type DeepKeys } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import {
  boolFilterFn,
  filterByText,
  listNotEmptyFilterFn,
  multiFilterFn,
  rangeFilterFn,
} from '@ui-kit/shared/ui/DataTable/filters'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMarket } from '../../../queries/market-list/llama-markets'
import {
  BoostCell,
  CompactUsdCell,
  HealthCell,
  LineGraphCell,
  LtvCell,
  MarketTitleCell,
  PercentCell,
  PriceCell,
  RateCell,
  UtilizationCell,
} from '../cells'
import {
  BorrowRateHeaderTooltipContent,
  CollateralBorrowHeaderTooltipContent,
  LendRateHeaderTooltipContent,
  LiquidityUsdHeaderTooltipContent,
  TvlHeaderTooltipContent,
  UtilizationHeaderTooltipContent,
} from '../header-tooltips'
import { LlamaMarketColumnId } from './columns.enum'

const columnHelper = createColumnHelper<LlamaMarket>()

const headers = {
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
  [LlamaMarketColumnId.LendRate]: t`Supply Yield`,
  [LlamaMarketColumnId.BorrowChart]: t`7D borrow APR`,
  [LlamaMarketColumnId.MaxLtv]: t`Max LTV`,
  [LlamaMarketColumnId.UtilizationPercent]: t`Utilization`,
  [LlamaMarketColumnId.LiquidityUsd]: t`Available Liquidity`,
  [LlamaMarketColumnId.Tvl]: t`TVL`,
  [LlamaMarketColumnId.TotalDebt]: t`Total Debt`,
  [LlamaMarketColumnId.TotalCollateralUsd]: t`Total Collateral`,
} as const

type Tooltip = ColumnMeta<never, never>['tooltip']
const createTooltip = (id: keyof typeof headers, body: ReactNode): Tooltip => ({
  title: headers[id],
  body,
})

/** Define a hidden column. */
const hidden = (field: DeepKeys<LlamaMarket>, id: LlamaMarketColumnId, filterFn: FilterFnOption<LlamaMarket>) =>
  columnHelper.accessor(field, {
    id,
    filterFn,
    meta: { hidden: true },
  })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LlamaColumn = ColumnDef<LlamaMarket, any>

/** Columns for the lending markets table. */
export const LLAMA_MARKET_COLUMNS = [
  columnHelper.accessor(LlamaMarketColumnId.Assets, {
    header: headers[LlamaMarketColumnId.Assets],
    cell: MarketTitleCell,
    filterFn: filterByText(
      'controllerAddress',
      'ammAddress',
      'vaultAddress',
      'assets.borrowed.address',
      'assets.borrowed.symbol',
      'assets.collateral.address',
      'assets.collateral.symbol',
    ),
    meta: { tooltip: createTooltip(LlamaMarketColumnId.Assets, <CollateralBorrowHeaderTooltipContent />) },
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserBorrowed,
    header: headers[LlamaMarketColumnId.UserBorrowed],
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserCollateral,
    header: headers[LlamaMarketColumnId.UserCollateral],
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserEarnings,
    header: headers[LlamaMarketColumnId.UserEarnings],
    cell: PriceCell,
    meta: { type: 'numeric', hidden: true }, // hidden until we have a backend
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserDeposited,
    header: headers[LlamaMarketColumnId.UserDeposited],
    cell: PriceCell,
    meta: { type: 'numeric' },
    filterFn: boolFilterFn,
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserBoostMultiplier,
    header: headers[LlamaMarketColumnId.UserBoostMultiplier],
    cell: BoostCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrowApr', {
    id: LlamaMarketColumnId.BorrowRate,
    header: headers[LlamaMarketColumnId.BorrowRate],
    cell: RateCell,
    meta: {
      type: 'numeric',
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrowTotalApr', {
    id: LlamaMarketColumnId.NetBorrowRate,
    header: headers[LlamaMarketColumnId.NetBorrowRate],
    cell: RateCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(LlamaMarketColumnId.NetBorrowRate, <BorrowRateHeaderTooltipContent />),
    },
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserLtv,
    header: headers[LlamaMarketColumnId.UserLtv],
    cell: LtvCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserHealth,
    header: headers[LlamaMarketColumnId.UserHealth],
    cell: HealthCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.lendTotalApyMinBoosted', {
    id: LlamaMarketColumnId.LendRate,
    header: headers[LlamaMarketColumnId.LendRate],
    cell: RateCell,
    meta: { type: 'numeric', tooltip: createTooltip(LlamaMarketColumnId.LendRate, <LendRateHeaderTooltipContent />) },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrowApr', {
    id: LlamaMarketColumnId.BorrowChart,
    header: headers[LlamaMarketColumnId.BorrowChart],
    cell: (c) => <LineGraphCell market={c.row.original} type={MarketRateType.Borrow} />,
  }),
  columnHelper.accessor(LlamaMarketColumnId.MaxLtv, {
    header: headers[LlamaMarketColumnId.MaxLtv],
    cell: PercentCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor(LlamaMarketColumnId.UtilizationPercent, {
    header: headers[LlamaMarketColumnId.UtilizationPercent],
    cell: UtilizationCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(LlamaMarketColumnId.UtilizationPercent, <UtilizationHeaderTooltipContent />),
    },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor(LlamaMarketColumnId.LiquidityUsd, {
    header: headers[LlamaMarketColumnId.LiquidityUsd],
    cell: CompactUsdCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(LlamaMarketColumnId.LiquidityUsd, <LiquidityUsdHeaderTooltipContent />),
    },
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor(LlamaMarketColumnId.TotalDebt, {
    header: headers[LlamaMarketColumnId.TotalDebt],
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.TotalCollateralUsd, {
    header: headers[LlamaMarketColumnId.TotalCollateralUsd],
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(LlamaMarketColumnId.Tvl, {
    header: headers[LlamaMarketColumnId.Tvl],
    cell: CompactUsdCell,
    meta: {
      type: 'numeric',
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
  hidden(
    LlamaMarketColumnId.UserHasPositions,
    LlamaMarketColumnId.UserHasPositions,
    (row, columnId, filterValue?: MarketRateType | boolean) => {
      const data = row.getValue<LlamaMarket[LlamaMarketColumnId.UserHasPositions]>(columnId)
      return (
        filterValue === undefined ||
        (typeof filterValue === 'boolean' && Boolean(data) === Boolean(filterValue)) ||
        (typeof filterValue === 'string' && Boolean(data?.[filterValue]))
      )
    },
  ),
  hidden(LlamaMarketColumnId.Rewards, LlamaMarketColumnId.Rewards, listNotEmptyFilterFn),
  hidden(LlamaMarketColumnId.DeprecatedMessage, LlamaMarketColumnId.DeprecatedMessage, boolFilterFn),
  hidden(LlamaMarketColumnId.Type, LlamaMarketColumnId.Type, multiFilterFn),
] satisfies LlamaColumn[]
