import { CandleChart } from '@evm-ui/features/candle-chart/CandleChart'
import { useChartPalette } from '@evm-ui/features/candle-chart/hooks/useChartPalette'
import { EvmChartStateWrapper } from '@evm-ui/shared/ui/EvmChartStateWrapper'
import Stack from '@mui/material/Stack'
import type { ChartSelections } from '@ui/features/charts/ChartHeader'
import type { ChartEmptyState } from '@ui/features/charts/ChartStateWrapper'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { LiquidationRanges, LpPriceOhlcDataFormatted, OraclePriceData, TimeOption } from './types'

export type OhlcSeries = { ohlcData: LpPriceOhlcDataFormatted[] | undefined; oraclePriceData?: OraclePriceData[] }

export type OhlcChartProps = {
  /**
   * If the chart is used on a Llamalend market page we hide the candle series label and label line.
   */
  hideCandleSeriesLabel: boolean
  chartHeight: number
  series: QueryProp<OhlcSeries>
  emptyState: Omit<ChartEmptyState<OhlcSeries>, 'isEmpty'>
  liquidationRange?: LiquidationRanges
  selectedChartKey: string | undefined
  timeOption: TimeOption
  refetchPricesData: () => Promise<unknown> | void
  fetchMoreChartData: () => Promise<unknown>
  oraclePriceVisible?: boolean
  liqRangeCurrentVisible?: boolean
  liqRangeNewVisible?: boolean
  selectChartList: ChartSelections[]
  latestOraclePrice?: number
  onVisiblePriceRangeChange?: (min: number, max: number) => void
}

export const OhlcChart = ({
  series,
  emptyState,
  refetchPricesData,
  chartHeight,
  selectChartList,
  selectedChartKey,
  ...candleProps
}: OhlcChartProps) => {
  const colors = useChartPalette()

  const selectedChartLabel = selectChartList.find(c => c.key === selectedChartKey)?.label

  return (
    <Stack direction="column" sx={{ width: '100%', minWidth: 0 }}>
      <EvmChartStateWrapper
        query={series}
        height={chartHeight}
        emptyState={{
          ...emptyState,
          // CandleChart can draw the oracle price line without candles, so the chart is only empty when both are missing
          isEmpty: ({ ohlcData, oraclePriceData }) => !ohlcData?.length && !oraclePriceData?.length,
        }}
        errorState={{
          description: selectedChartLabel
            ? t`Unable to fetch "${selectedChartLabel}" data.`
            : t`Unable to fetch chart data.`,
          onReload: refetchPricesData,
        }}
      >
        {({ ohlcData, oraclePriceData }) => (
          <CandleChart
            {...candleProps}
            chartHeight={chartHeight}
            ohlcData={ohlcData}
            oraclePriceData={oraclePriceData}
            colors={colors}
          />
        )}
      </EvmChartStateWrapper>
    </Stack>
  )
}
