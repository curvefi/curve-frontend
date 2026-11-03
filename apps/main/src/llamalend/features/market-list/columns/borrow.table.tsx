import { LIQUIDATION_BUFFER_TOOLTIP } from '@/llamalend/features/market-position-details/tooltips/tooltips'
import { EquityTooltipContent } from '@/llamalend/widgets/tooltips/EquityTooltipContent'
import { LeverageTooltipContent } from '@/llamalend/widgets/tooltips/LeverageTooltipContent'
import { LoopedAprTooltipContent } from '@/llamalend/widgets/tooltips/LoopedAprTooltipContent'
import { PnlTooltipContent } from '@/llamalend/widgets/tooltips/PnlTooltipContent'
import { MarketRateType } from '@evm-ui/types/market'
import { t } from '@ui/lib/i18n'
import { HealthCell } from '../cells/HealthCell'
import { LtvCell } from '../cells/LtvCell'
import {
  BandCountCell,
  CollateralCompositionCell,
  LeverageCell,
  LiquidationBufferCell,
  LoopedAprCell,
} from '../cells/PositionMetricCells'
import { EquityCell, PnlCell } from '../cells/PositionPnlCells'
import { PriceCell } from '../cells/PriceCell'
import {
  getUserBandCount,
  getUserBorrowedUsd,
  getUserCollateralShare,
  getUserCollateralUsd,
  getUserEquityUsd,
  getUserLeverage,
  getUserLiquidationBuffer,
  getUserLoopedApr,
  getUserPnlUsd,
  getUserPositionHealth,
  getUserPositionLtv,
} from '../user-position.utils'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'
import { adapt, defineMarketTable, inGroup } from './market-table'
import { assetsColumn, borrowRateColumn, columnHelper, type MarketTable } from './shared.columns'

const userBorrowedColumn = columnHelper.accessor(getUserBorrowedUsd, {
  id: MarketColumnId.UserBorrowed,
  header: MARKET_TITLES[MarketColumnId.UserBorrowed],
  cell: PriceCell,
  meta: { type: 'numeric' },
  sortUndefined: 'last',
})

const userCollateralColumn = columnHelper.accessor(getUserCollateralUsd, {
  id: MarketColumnId.UserCollateral,
  header: MARKET_TITLES[MarketColumnId.UserCollateral],
  cell: PriceCell,
  meta: { type: 'numeric' },
  sortUndefined: 'last',
})

const userLtvColumn = columnHelper.accessor(getUserPositionLtv, {
  id: MarketColumnId.UserLtv,
  header: MARKET_TITLES[MarketColumnId.UserLtv],
  cell: LtvCell,
  meta: { type: 'numeric' },
  sortUndefined: 'last',
})

const userEquityColumn = columnHelper.accessor(getUserEquityUsd, {
  id: MarketColumnId.UserEquity,
  header: MARKET_TITLES[MarketColumnId.UserEquity],
  cell: EquityCell,
  meta: {
    type: 'numeric',
    tooltip: { title: MARKET_TITLES[MarketColumnId.UserEquity], body: <EquityTooltipContent /> },
  },
  sortUndefined: 'last',
})

const userPnlColumn = columnHelper.accessor(getUserPnlUsd, {
  id: MarketColumnId.UserPnl,
  header: MARKET_TITLES[MarketColumnId.UserPnl],
  cell: PnlCell,
  meta: { type: 'numeric', tooltip: { title: MARKET_TITLES[MarketColumnId.UserPnl], body: <PnlTooltipContent /> } },
  sortUndefined: 'last',
})

const userHealthColumn = columnHelper.accessor(getUserPositionHealth, {
  id: MarketColumnId.UserHealth,
  header: MARKET_TITLES[MarketColumnId.UserHealth],
  cell: HealthCell,
  meta: { type: 'numeric' },
  sortUndefined: 'last',
})

const BORROW_TABLE_OPTIONS = {
  testId: 'borrow',
  defaultSort: [{ id: MarketColumnId.UserBorrowed, desc: true }],
  sortQueryField: 'userSortBorrow',
}

export const LEGACY_BORROW_TABLE: MarketTable = defineMarketTable({
  ...BORROW_TABLE_OPTIONS,
  storageKey: 'My Borrow Positions',
  deprecatedVariants: [MarketRateType.Borrow], // used for the v9 -> v10 migration, this will be removed in the future
  columns: columnHelper.columns([
    assetsColumn,
    ...inGroup(t`Borrow`, [
      userBorrowedColumn,
      userCollateralColumn,
      borrowRateColumn,
      userLtvColumn,
      userEquityColumn,
      userPnlColumn,
      userHealthColumn,
    ]),
  ]),
})

export const BORROW_TABLE: MarketTable = defineMarketTable({
  ...BORROW_TABLE_OPTIONS,
  storageKey: 'User Borrow Positions',
  deprecatedVariants: [],
  columns: columnHelper.columns([
    assetsColumn,
    ...inGroup(t`Borrow`, [
      userEquityColumn,
      userPnlColumn,
      adapt(userBorrowedColumn, { header: t`Total debt` }),
      adapt(userCollateralColumn, { header: t`Collateral`, meta: { defaultHidden: true } }),
      adapt(userLtvColumn, { header: t`LTV ratio`, meta: { defaultHidden: true } }),
      borrowRateColumn,
      userHealthColumn,
      columnHelper.accessor(getUserLiquidationBuffer, {
        id: MarketColumnId.UserLiquidationBuffer,
        header: MARKET_TITLES[MarketColumnId.UserLiquidationBuffer],
        cell: LiquidationBufferCell,
        meta: {
          type: 'numeric',
          unit: 'percentage',
          tooltip: {
            title: MARKET_TITLES[MarketColumnId.UserLiquidationBuffer],
            body: LIQUIDATION_BUFFER_TOOLTIP.body,
          },
          defaultHidden: true,
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserLeverage, {
        id: MarketColumnId.UserLeverage,
        header: MARKET_TITLES[MarketColumnId.UserLeverage],
        cell: LeverageCell,
        meta: {
          type: 'numeric',
          tooltip: { title: MARKET_TITLES[MarketColumnId.UserLeverage], body: <LeverageTooltipContent /> },
          defaultHidden: true,
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserLoopedApr, {
        id: MarketColumnId.UserLoopedApr,
        header: MARKET_TITLES[MarketColumnId.UserLoopedApr],
        cell: LoopedAprCell,
        meta: {
          type: 'numeric',
          unit: 'percentage',
          tooltip: { title: MARKET_TITLES[MarketColumnId.UserLoopedApr], body: <LoopedAprTooltipContent /> },
          defaultHidden: true,
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserBandCount, {
        id: MarketColumnId.UserBandCount,
        header: MARKET_TITLES[MarketColumnId.UserBandCount],
        cell: BandCountCell,
        meta: { type: 'numeric', defaultHidden: true },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserCollateralShare, {
        id: MarketColumnId.UserCollateralComposition,
        header: MARKET_TITLES[MarketColumnId.UserCollateralComposition],
        cell: CollateralCompositionCell,
        meta: { type: 'numeric', unit: 'percentage', defaultHidden: true },
        sortUndefined: 'last',
      }),
    ]),
  ]),
})
