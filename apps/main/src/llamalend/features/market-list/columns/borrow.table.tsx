import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { EquityTooltipContent } from '@/llamalend/widgets/tooltips/EquityTooltipContent'
import { PnlTooltipContent } from '@/llamalend/widgets/tooltips/PnlTooltipContent'
import { MarketRateType } from '@evm-ui/types/market'
import { withQuery } from '@ui/features/tables/withQuery'
import { t } from '@ui/lib/i18n'
import { EquityCell, LtvCell, PnlCell } from '../cells/BorrowPositionCells'
import { LegacyHealthCell } from '../cells/LegacyHealthCell'
import { PriceCell } from '../cells/PriceCell'
import {
  getUserBorrowedUsd,
  getUserCollateralUsd,
  getUserEquityUsd,
  getUserPnlUsd,
  getUserLegacyHealth,
  getUserPositionLtv,
} from '../user-position.utils'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'
import { defineMarketTable, inGroup } from './market-table'
import { assetsColumn, borrowRateColumn, columnHelper, type MarketTable } from './shared.columns'

const getStatsQuery = ({ positionQueries: { stats } }: LlamaMarketRow) => stats

export const BORROW_TABLE: MarketTable = defineMarketTable({
  testId: 'borrow',
  defaultSort: [{ id: MarketColumnId.UserBorrowed, desc: true }],
  sortQueryField: 'userSortBorrow',
  storageKey: 'my-borrow-positions',
  deprecatedVariants: [MarketRateType.Borrow], // used for the v9 -> v10 migration, this will be removed in the future
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
        cell: withQuery(getStatsQuery, LtvCell),
        meta: { type: 'numeric' },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserEquityUsd, {
        id: MarketColumnId.UserEquity,
        header: MARKET_TITLES[MarketColumnId.UserEquity],
        cell: withQuery(row => row.positionQueries.equityUsd, EquityCell),
        meta: {
          type: 'numeric',
          tooltip: { title: MARKET_TITLES[MarketColumnId.UserEquity], body: <EquityTooltipContent /> },
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserPnlUsd, {
        id: MarketColumnId.UserPnl,
        header: MARKET_TITLES[MarketColumnId.UserPnl],
        cell: withQuery(row => row.positionQueries.pnlUsd, PnlCell),
        meta: {
          type: 'numeric',
          tooltip: { title: MARKET_TITLES[MarketColumnId.UserPnl], body: <PnlTooltipContent /> },
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserLegacyHealth, {
        id: MarketColumnId.UserHealth,
        header: MARKET_TITLES[MarketColumnId.UserHealth],
        cell: withQuery(getStatsQuery, LegacyHealthCell),
        meta: { type: 'numeric' },
        sortUndefined: 'last',
      }),
    ]),
  ]),
})
