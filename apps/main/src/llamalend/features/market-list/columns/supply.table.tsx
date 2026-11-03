import { MarketRateType } from '@evm-ui/types/market'
import { t } from '@ui/lib/i18n'
import { BoostCell } from '../cells/BoostCell'
import { PriceCell } from '../cells/PriceCell'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'
import { defineMarketTable, inGroup } from './market-table'
import { assetsColumn, columnHelper, type MarketTable, supplyRateColumn } from './shared.columns'

export const SUPPLY_TABLE: MarketTable = defineMarketTable({
  testId: 'supply',
  defaultSort: [{ id: MarketColumnId.UserDeposited, desc: true }],
  sortQueryField: 'userSortSupply',
  storageKey: 'My Supply Positions',
  deprecatedVariants: [MarketRateType.Supply],
  columns: columnHelper.columns([
    assetsColumn,
    ...inGroup(t`Supply`, [
      columnHelper.accessor('lendingPosition.supplied', {
        id: MarketColumnId.UserDeposited,
        header: MARKET_TITLES[MarketColumnId.UserDeposited],
        cell: PriceCell,
        meta: { type: 'numeric' },
        sortUndefined: 'last',
      }),
      columnHelper.accessor('lendingPosition.boostMultiplier', {
        id: MarketColumnId.UserBoostMultiplier,
        header: MARKET_TITLES[MarketColumnId.UserBoostMultiplier],
        cell: BoostCell,
        meta: { type: 'numeric' },
        sortUndefined: 'last',
      }),
      supplyRateColumn,
    ]),
  ]),
})
