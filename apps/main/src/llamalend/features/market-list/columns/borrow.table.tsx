import { HealthTooltipContent } from '@/llamalend/features/market-position-details/tooltips/HealthTooltipContent'
import { LiquidationBufferTooltipContent } from '@/llamalend/features/market-position-details/tooltips/LiquidationBufferTooltipContent'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { EquityTooltipContent } from '@/llamalend/widgets/tooltips/EquityTooltipContent'
import { LeverageTooltipContent } from '@/llamalend/widgets/tooltips/LeverageTooltipContent'
import { LoopedAprTooltipContent } from '@/llamalend/widgets/tooltips/LoopedAprTooltipContent'
import { PnlTooltipContent } from '@/llamalend/widgets/tooltips/PnlTooltipContent'
import { MarketRateType } from '@evm-ui/types/market'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { combineQueries } from '@ui/features/queries/combine'
import { withQuery } from '@ui/features/tables/withQuery'
import { t } from '@ui/lib/i18n'
import {
  BandCountCell,
  CollateralCompositionCell,
  DistanceToRangeCell,
  EquityCell,
  HealthCell,
  LeverageCell,
  LiquidationBufferCell,
  LoopedAprCell,
  LtvCell,
  PnlCell,
} from '../cells/BorrowPositionCells'
import { LegacyHealthCell } from '../cells/LegacyHealthCell'
import { PriceCell } from '../cells/PriceCell'
import {
  getUserBandCount,
  getUserBorrowedUsd,
  getUserCollateralShare,
  getUserCollateralUsd,
  getUserEquityUsd,
  getUserDistanceToRange,
  getUserHealth,
  getUserLeverage,
  getUserLiquidationBuffer,
  getUserLoopedApr,
  getUserPnlUsd,
  getUserLegacyHealth,
  getUserPositionLtv,
} from '../user-position.utils'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'
import { adapt, defineMarketTable, inGroup } from './market-table'
import { assetsColumn, borrowRateColumn, columnHelper, type MarketTable } from './shared.columns'

const getStatsQuery = ({ positionQueries: { stats } }: LlamaMarketRow) => stats

/** The leverage metrics are only shown once we know the position is zap leveraged */
const getLeverageQuery = ({ positionQueries: { stats, isZapLeveraged } }: LlamaMarketRow) =>
  combineQueries([stats, isZapLeveraged], stats => stats)

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
  cell: withQuery(getStatsQuery, LtvCell),
  meta: { type: 'numeric' },
  sortUndefined: 'last',
})

const userEquityColumn = columnHelper.accessor(getUserEquityUsd, {
  id: MarketColumnId.UserEquity,
  header: MARKET_TITLES[MarketColumnId.UserEquity],
  cell: withQuery(row => row.positionQueries.equityUsd, EquityCell),
  meta: {
    type: 'numeric',
    tooltip: { title: MARKET_TITLES[MarketColumnId.UserEquity], body: <EquityTooltipContent /> },
  },
  sortUndefined: 'last',
})

const userPnlColumn = columnHelper.accessor(getUserPnlUsd, {
  id: MarketColumnId.UserPnl,
  header: MARKET_TITLES[MarketColumnId.UserPnl],
  cell: withQuery(row => row.positionQueries.pnlUsd, PnlCell),
  meta: { type: 'numeric', tooltip: { title: MARKET_TITLES[MarketColumnId.UserPnl], body: <PnlTooltipContent /> } },
  sortUndefined: 'last',
})

const userLegacyHealthColumn = columnHelper.accessor(getUserLegacyHealth, {
  id: MarketColumnId.UserHealth,
  header: MARKET_TITLES[MarketColumnId.UserHealth],
  cell: withQuery(getStatsQuery, LegacyHealthCell),
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
  storageKey: 'my-borrow-positions',
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
      userLegacyHealthColumn,
    ]),
  ]),
})

export const BORROW_TABLE: MarketTable = defineMarketTable({
  ...BORROW_TABLE_OPTIONS,
  storageKey: 'user-borrow-positions',
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
      columnHelper.accessor(getUserHealth, {
        id: MarketColumnId.UserHealth,
        header: MARKET_TITLES[MarketColumnId.UserHealth],
        cell: withQuery(getStatsQuery, HealthCell),
        meta: {
          type: 'numeric',
          tooltip: { title: MARKET_TITLES[MarketColumnId.UserHealth], body: <HealthTooltipContent /> },
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserDistanceToRange, {
        id: MarketColumnId.UserDistanceToRange,
        header: MARKET_TITLES[MarketColumnId.UserDistanceToRange],
        cell: withQuery(getStatsQuery, DistanceToRangeCell),
        meta: {
          type: 'numeric',
          unit: 'percentage',
          tooltip: {
            title: MARKET_TITLES[MarketColumnId.UserDistanceToRange],
            body: (
              <TooltipWrapper>
                <TooltipDescription
                  text={t`How far the oracle price must move to reach your liquidation range. Shown below are the bottom and top prices of the range.`}
                />
              </TooltipWrapper>
            ),
          },
          defaultHidden: true,
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserLiquidationBuffer, {
        id: MarketColumnId.UserLiquidationBuffer,
        header: MARKET_TITLES[MarketColumnId.UserLiquidationBuffer],
        cell: withQuery(getStatsQuery, LiquidationBufferCell),
        meta: {
          type: 'numeric',
          unit: 'percentage',
          tooltip: {
            title: MARKET_TITLES[MarketColumnId.UserLiquidationBuffer],
            body: <LiquidationBufferTooltipContent />,
          },
          defaultHidden: true,
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserLeverage, {
        id: MarketColumnId.UserLeverage,
        header: MARKET_TITLES[MarketColumnId.UserLeverage],
        cell: withQuery(getLeverageQuery, LeverageCell),
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
        cell: withQuery(getLeverageQuery, LoopedAprCell),
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
        cell: withQuery(getStatsQuery, BandCountCell),
        meta: { type: 'numeric', defaultHidden: true },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserCollateralShare, {
        id: MarketColumnId.UserCollateralComposition,
        header: MARKET_TITLES[MarketColumnId.UserCollateralComposition],
        cell: withQuery(getStatsQuery, CollateralCompositionCell),
        meta: { type: 'numeric', unit: 'percentage', defaultHidden: true },
        sortUndefined: 'last',
      }),
    ]),
  ]),
})
