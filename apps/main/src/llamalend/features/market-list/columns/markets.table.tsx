import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { getMaxReturnOnEquity } from '@/llamalend/rates.utils'
import { MaxReturnOnEquityTooltipContent } from '@/llamalend/widgets/tooltips/MaxReturnOnEquityTooltipContent'
import { SolvencyTooltip } from '@/llamalend/widgets/tooltips/SolvencyTooltip'
import { MarketRateType } from '@evm-ui/types/market'
import { boolFilterFn, listNotEmptyFilterFn, multiFilterFn, rangeFilterFn } from '@ui/features/tables/filters'
import { t } from '@ui/lib/i18n'
import { CompactUsdCell } from '../cells/CompactUsdCell'
import { LineGraphCell } from '../cells/LineGraphCell'
import { LiquidityUsdCell } from '../cells/LiquidityUsdCell'
import { MaxLeverageCell } from '../cells/MaxLeverageCell'
import { MaxReturnOnEquityCell } from '../cells/MaxReturnOnEquityCell'
import { PercentCell } from '../cells/PercentCell'
import { RateCell } from '../cells/RateCell/RateCell'
import { SolvencyCell } from '../cells/SolvencyCell'
import { TvlCell } from '../cells/TvlCell'
import { UtilizationCell } from '../cells/UtilizationCell'
import { BorrowAprHeaderTooltipContent } from '../header-tooltips/BorrowAprHeaderTooltipContent'
import { LiquidityUsdHeaderTooltipContent } from '../header-tooltips/LiquidityUsdHeaderTooltipContent'
import { NetSupplyRateHeaderTooltipContent } from '../header-tooltips/SupplyRateHeaderTooltipContent'
import { TvlHeaderTooltipContent } from '../header-tooltips/TvlHeaderTooltipContent'
import { UtilizationHeaderTooltipContent } from '../header-tooltips/UtilizationHeaderTooltipContent'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'
import { defineMarketTable, inGroup } from './market-table'
import { assetsColumn, borrowRateColumn, columnHelper, type MarketTable, supplyRateColumn } from './shared.columns'

export const MARKETS_TABLE: MarketTable = defineMarketTable({
  testId: 'lamalend-markets',
  defaultSort: [{ id: MarketColumnId.Tvl, desc: true }],
  sortQueryField: 'sort',
  storageKey: 'Llamalend Markets',
  storedVariant: 'noPositions',
  columns: columnHelper.columns([
    assetsColumn,
    ...inGroup(t`Borrow`, [
      borrowRateColumn,
      columnHelper.accessor('rates.borrowTotalApr', {
        id: MarketColumnId.NetBorrowRate,
        header: MARKET_TITLES[MarketColumnId.NetBorrowRate],
        cell: RateCell,
        meta: {
          type: 'numeric',
          unit: 'percentage',
          tooltip: { title: MARKET_TITLES[MarketColumnId.NetBorrowRate], body: <BorrowAprHeaderTooltipContent /> },
          defaultHidden: true,
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(({ assets }) => assets.collateral.rebasingYieldApr ?? undefined, {
        id: MarketColumnId.CollateralYield,
        header: MARKET_TITLES[MarketColumnId.CollateralYield],
        cell: PercentCell,
        meta: { type: 'numeric', unit: 'percentage', defaultHidden: true },
        sortUndefined: 'last',
      }),
    ]),
    ...inGroup(t`Lend`, [
      supplyRateColumn,
      columnHelper.accessor('rates.lendTotalApyMinBoosted', {
        id: MarketColumnId.NetSupplyRate,
        header: MARKET_TITLES[MarketColumnId.NetSupplyRate],
        cell: RateCell,
        meta: {
          type: 'numeric',
          tooltip: { title: MARKET_TITLES[MarketColumnId.NetSupplyRate], body: <NetSupplyRateHeaderTooltipContent /> },
          defaultHidden: true,
        },
        sortUndefined: 'last',
      }),
    ]),
    ...inGroup(t`Borrow`, [
      columnHelper.accessor('rates.borrowApr', {
        id: MarketColumnId.BorrowChart,
        header: MARKET_TITLES[MarketColumnId.BorrowChart],
        enableSorting: false,
        cell: c => <LineGraphCell market={c.row.original} type={MarketRateType.Borrow} />,
        meta: { defaultHidden: true },
      }),
    ]),
    ...inGroup(t`Markets`, [
      columnHelper.accessor<(row: LlamaMarketRow) => LlamaMarketRow['leverage'], LlamaMarketRow['leverage']>(
        row => row.leverage,
        {
          id: MarketColumnId.MaxLeverage,
          header: MARKET_TITLES[MarketColumnId.MaxLeverage],
          cell: MaxLeverageCell,
          meta: { type: 'numeric' },
          sortUndefined: 'last',
        },
      ),
      columnHelper.accessor(getMaxReturnOnEquity, {
        id: MarketColumnId.MaxReturnOnEquity,
        header: MARKET_TITLES[MarketColumnId.MaxReturnOnEquity],
        cell: MaxReturnOnEquityCell,
        meta: {
          type: 'numeric',
          unit: 'percentage',
          tooltip: {
            title: MARKET_TITLES[MarketColumnId.MaxReturnOnEquity],
            body: <MaxReturnOnEquityTooltipContent />,
          },
          defaultHidden: true,
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(row => row.maxLtv ?? undefined, {
        id: MarketColumnId.MaxLtv,
        header: MARKET_TITLES[MarketColumnId.MaxLtv],
        cell: PercentCell,
        meta: { type: 'numeric', unit: 'percentage', defaultHidden: true },
        filterFn: rangeFilterFn,
        sortUndefined: 'last',
      }),
      columnHelper.accessor('utilizationPercent', {
        id: MarketColumnId.UtilizationPercent,
        header: MARKET_TITLES[MarketColumnId.UtilizationPercent],
        cell: UtilizationCell,
        meta: {
          type: 'numeric',
          unit: 'percentage',
          tooltip: {
            title: MARKET_TITLES[MarketColumnId.UtilizationPercent],
            body: <UtilizationHeaderTooltipContent />,
          },
        },
        filterFn: rangeFilterFn,
      }),
      columnHelper.accessor(
        // Normalize null to undefined so sortUndefined places missing solvency values last
        ({ solvencyPercent }) => solvencyPercent ?? undefined,
        {
          id: MarketColumnId.SolvencyPercent,
          header: MARKET_TITLES[MarketColumnId.SolvencyPercent],
          cell: SolvencyCell,
          meta: {
            type: 'numeric',
            unit: 'percentage',
            tooltip: {
              title: MARKET_TITLES[MarketColumnId.SolvencyPercent],
              body: <SolvencyTooltip type="overview" />,
            },
            defaultHidden: true,
          },
          sortUndefined: 'last',
        },
      ),
      columnHelper.accessor('liquidityUsd', {
        id: MarketColumnId.LiquidityUsd,
        header: MARKET_TITLES[MarketColumnId.LiquidityUsd],
        cell: LiquidityUsdCell,
        meta: {
          type: 'numeric',
          unit: 'dollar',
          tooltip: { title: MARKET_TITLES[MarketColumnId.LiquidityUsd], body: <LiquidityUsdHeaderTooltipContent /> },
        },
        filterFn: rangeFilterFn,
      }),
      columnHelper.accessor('totalDebtUsd', {
        id: MarketColumnId.TotalDebt,
        header: MARKET_TITLES[MarketColumnId.TotalDebt],
        cell: CompactUsdCell,
        meta: { type: 'numeric', defaultHidden: true },
        sortUndefined: 'last',
      }),
      columnHelper.accessor('totalCollateralUsd', {
        id: MarketColumnId.TotalCollateralUsd,
        header: MARKET_TITLES[MarketColumnId.TotalCollateralUsd],
        cell: CompactUsdCell,
        meta: { type: 'numeric', defaultHidden: true },
        sortUndefined: 'last',
      }),
      columnHelper.accessor('tvl', {
        id: MarketColumnId.Tvl,
        header: MARKET_TITLES[MarketColumnId.Tvl],
        cell: TvlCell,
        meta: {
          type: 'numeric',
          unit: 'dollar',
          tooltip: { title: MARKET_TITLES[MarketColumnId.Tvl], body: <TvlHeaderTooltipContent /> },
        },
        sortUndefined: 'last',
        filterFn: rangeFilterFn,
      }),
    ]),
    columnHelper.accessor('blockchainId', { id: MarketColumnId.Chain, filterFn: multiFilterFn }),
    columnHelper.accessor('assets.collateral.symbol', { id: MarketColumnId.CollateralSymbol, filterFn: multiFilterFn }),
    columnHelper.accessor('assets.borrowed.symbol', { id: MarketColumnId.BorrowedSymbol, filterFn: multiFilterFn }),
    columnHelper.accessor('isFavorite', { id: MarketColumnId.IsFavorite, filterFn: boolFilterFn }),
    columnHelper.accessor('rewards', { id: MarketColumnId.Rewards, filterFn: listNotEmptyFilterFn }),
    columnHelper.accessor('deprecatedMessage', { id: MarketColumnId.DeprecatedMessage, filterFn: boolFilterFn }),
    columnHelper.accessor('type', { id: MarketColumnId.Type, filterFn: multiFilterFn }),
    columnHelper.accessor('version', { id: MarketColumnId.Version, filterFn: multiFilterFn }),
  ]),
})
