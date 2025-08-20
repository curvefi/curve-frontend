import { ColumnDef, createColumnHelper, FilterFnOption } from '@tanstack/react-table'
import { type DeepKeys } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMarket } from '../entities/llama-markets'
import {
  CompactUsdCell,
  LineGraphCell,
  MarketTitleCell,
  PercentageCell,
  PriceCell,
  RateCell,
  UtilizationCell,
} from './cells'
import { LlamaMarketColumnId } from './columns.enum'
import { boolFilterFn, filterByText, listFilterFn, multiFilterFn } from './filters'

const columnHelper = createColumnHelper<LlamaMarket>()

/** Define a hidden column. */
const hidden = (field: DeepKeys<LlamaMarket>, id: LlamaMarketColumnId, filterFn: FilterFnOption<LlamaMarket>) =>
  columnHelper.accessor(field, {
    id,
    filterFn,
    meta: { hidden: true },
  })

type LlamaColumn = ColumnDef<LlamaMarket, any>

/** Columns for the lending markets table. */
export const LLAMA_MARKET_COLUMNS = [
  columnHelper.accessor(LlamaMarketColumnId.Assets, {
    header: t`Collateral • Borrow`,
    cell: MarketTitleCell,
    filterFn: filterByText,
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserHealth,
    header: t`Health`,
    cell: PercentageCell,
    meta: { type: 'numeric', hideZero: true },
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserBorrowed,
    header: t`Borrow Amount`,
    cell: PriceCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserEarnings,
    header: t`My Earnings`,
    cell: PriceCell,
    meta: { type: 'numeric', hidden: true }, // hidden until we have a backend
    sortUndefined: 'last',
  }),
  columnHelper.display({
    id: LlamaMarketColumnId.UserDeposited,
    header: t`Supplied Amount`,
    cell: PriceCell,
    meta: { type: 'numeric' },
    filterFn: boolFilterFn,
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrow', {
    id: LlamaMarketColumnId.BorrowRate,
    header: t`Borrow Rate`,
    cell: RateCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.lend', {
    id: LlamaMarketColumnId.LendRate,
    header: t`Supply Yield`,
    cell: RateCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('rates.borrow', {
    id: LlamaMarketColumnId.BorrowChart,
    header: t`7D Rate Chart`,
    cell: (c) => <LineGraphCell market={c.row.original} type={MarketRateType.Borrow} />,
  }),
  columnHelper.accessor(LlamaMarketColumnId.UtilizationPercent, {
    header: t`Utilization`,
    cell: UtilizationCell,
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor(LlamaMarketColumnId.LiquidityUsd, {
    header: t`Available Liquidity`,
    cell: CompactUsdCell,
    meta: { type: 'numeric' },
  }),
  // Following columns are used in tanstack filter, but they are displayed together in MarketTitleCell
  hidden(LlamaMarketColumnId.Chain, LlamaMarketColumnId.Chain, multiFilterFn),
  hidden('assets.collateral.symbol', LlamaMarketColumnId.CollateralSymbol, multiFilterFn),
  hidden('assets.borrowed.symbol', LlamaMarketColumnId.BorrowedSymbol, multiFilterFn),
  hidden(LlamaMarketColumnId.IsFavorite, LlamaMarketColumnId.IsFavorite, boolFilterFn),
  hidden(
    LlamaMarketColumnId.UserPositions,
    LlamaMarketColumnId.UserPositions,
    (row, columnId, filterValue?: MarketRateType | boolean) => {
      const data = row.getValue<LlamaMarket[LlamaMarketColumnId.UserPositions]>(columnId)
      return (
        filterValue === undefined ||
        (typeof filterValue === 'boolean' && Boolean(data) === Boolean(filterValue)) ||
        (typeof filterValue === 'string' && Boolean(data?.[filterValue]))
      )
    },
  ),
  hidden(LlamaMarketColumnId.Rewards, LlamaMarketColumnId.Rewards, listFilterFn),
  hidden(LlamaMarketColumnId.Type, LlamaMarketColumnId.Type, multiFilterFn),
] satisfies LlamaColumn[]

export const DEFAULT_SORT = [{ id: LlamaMarketColumnId.LiquidityUsd, desc: true }]
