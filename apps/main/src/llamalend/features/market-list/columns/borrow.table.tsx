import { EquityTooltipContent } from '@/llamalend/widgets/tooltips/EquityTooltipContent'
import { PnlTooltipContent } from '@/llamalend/widgets/tooltips/PnlTooltipContent'
import { MarketRateType } from '@evm-ui/types/market'
import { t } from '@ui/lib/i18n'
import { HealthCell } from '../cells/HealthCell'
import { LtvCell } from '../cells/LtvCell'
import { EquityCell, PnlCell } from '../cells/PositionPnlCells'
import { PriceCell } from '../cells/PriceCell'
import {
  getUserBorrowedUsd,
  getUserCollateralUsd,
  getUserEquityUsd,
  getUserPnlUsd,
  getUserPositionHealth,
  getUserPositionLtv,
} from '../user-position.utils'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'
import { defineMarketTable, inGroup } from './market-table'
import { assetsColumn, borrowRateColumn, columnHelper, type MarketTable } from './shared.columns'

export const BORROW_TABLE: MarketTable = defineMarketTable({
  testId: 'borrow',
  defaultSort: [{ id: MarketColumnId.UserBorrowed, desc: true }],
  sortQueryField: 'userSortBorrow',
  storageKey: 'My Borrow Positions',
  deprecatedVariants: [MarketRateType.Borrow],
  columns: columnHelper.columns([
    assetsColumn,
    ...inGroup(t`Borrow`, [
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
      borrowRateColumn,
      columnHelper.accessor(getUserPositionLtv, {
        id: MarketColumnId.UserLtv,
        header: MARKET_TITLES[MarketColumnId.UserLtv],
        cell: LtvCell,
        meta: { type: 'numeric' },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserEquityUsd, {
        id: MarketColumnId.UserEquity,
        header: MARKET_TITLES[MarketColumnId.UserEquity],
        cell: EquityCell,
        meta: {
          type: 'numeric',
          tooltip: { title: MARKET_TITLES[MarketColumnId.UserEquity], body: <EquityTooltipContent /> },
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserPnlUsd, {
        id: MarketColumnId.UserPnl,
        header: MARKET_TITLES[MarketColumnId.UserPnl],
        cell: PnlCell,
        meta: {
          type: 'numeric',
          tooltip: { title: MARKET_TITLES[MarketColumnId.UserPnl], body: <PnlTooltipContent /> },
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserPositionHealth, {
        id: MarketColumnId.UserHealth,
        header: MARKET_TITLES[MarketColumnId.UserHealth],
        cell: HealthCell,
        meta: { type: 'numeric' },
        sortUndefined: 'last',
      }),
    ]),
  ]),
})
