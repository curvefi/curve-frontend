import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'
import { rangeFilterFn } from '@ui/features/tables/filters'
import { MarketTitleCell } from '../cells/MarketTitleCell'
import { RateCell } from '../cells/RateCell/RateCell'
import { BorrowAprHeaderTooltipContent } from '../header-tooltips/BorrowAprHeaderTooltipContent'
import { CollateralBorrowHeaderTooltipContent } from '../header-tooltips/CollateralBorrowHeaderTooltipContent'
import { SupplyRateHeaderTooltipContent } from '../header-tooltips/SupplyRateHeaderTooltipContent'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'
import type { defineMarketTable } from './market-table'

export const columnHelper = createAppColumnHelper<LlamaMarketRow>()

export type MarketTable = ReturnType<typeof defineMarketTable<ReturnType<typeof columnHelper.columns>[number]>>

export const assetsColumn = columnHelper.accessor(
  ({ assets }) => `${assets.collateral.symbol.toLowerCase()}•${assets.borrowed.symbol.toLowerCase()}`,
  {
    id: MarketColumnId.Assets,
    header: MARKET_TITLES[MarketColumnId.Assets],
    cell: MarketTitleCell,
    meta: { tooltip: { title: MARKET_TITLES[MarketColumnId.Assets], body: <CollateralBorrowHeaderTooltipContent /> } },
    enableSorting: false,
    enableHiding: false,
  },
)

export const borrowRateColumn = columnHelper.accessor('rates.borrowApr', {
  id: MarketColumnId.BorrowRate,
  header: MARKET_TITLES[MarketColumnId.BorrowRate],
  cell: RateCell,
  meta: {
    type: 'numeric',
    unit: 'percentage',
    tooltip: { title: MARKET_TITLES[MarketColumnId.BorrowRate], body: <BorrowAprHeaderTooltipContent /> },
  },
  sortUndefined: 'last',
  filterFn: rangeFilterFn,
})

export const supplyRateColumn = columnHelper.accessor('rates.lendApy', {
  id: MarketColumnId.SupplyRate,
  header: MARKET_TITLES[MarketColumnId.SupplyRate],
  cell: RateCell,
  meta: {
    type: 'numeric',
    tooltip: { title: MARKET_TITLES[MarketColumnId.SupplyRate], body: <SupplyRateHeaderTooltipContent /> },
  },
  sortUndefined: 'last',
})
