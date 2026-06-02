import Stack from '@mui/material/Stack'
import { CandleChart } from '@ui-kit/features/candle-chart/CandleChart'
import { useChartPalette } from '@ui-kit/features/candle-chart/hooks/useChartPalette'
import { t } from '@ui-kit/lib/i18n'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart'
import type { ChartSelections } from '@ui-kit/shared/ui/Chart/ChartHeader'
import type { LiquidationRanges, LpPriceOhlcDataFormatted, OraclePriceData, TimeOption } from './types'

export type OhlcChartProps = {
  /**
   * If the chart is used on a Llamalend market page we hide the candle series label and label line.
   */
  hideCandleSeriesLabel: boolean
  chartHeight: number
  isLoading: boolean
  error: Error | null
  betaBackgroundColor?: string // Used during the beta phase of the new theme migration to pass theme bg color
  ohlcData: LpPriceOhlcDataFormatted[]
  oraclePriceData?: OraclePriceData[]
  liquidationRange?: LiquidationRanges
  selectedChartKey: string
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

export const ChartWrapper = ({
  hideCandleSeriesLabel,
  chartHeight,
  isLoading,
  error,
  betaBackgroundColor,
  ohlcData,
  oraclePriceData,
  liquidationRange,
  selectedChartKey,
  timeOption,
  refetchPricesData,
  fetchMoreChartData,
  oraclePriceVisible,
  liqRangeCurrentVisible,
  liqRangeNewVisible,
  selectChartList,
  latestOraclePrice,
  onVisiblePriceRangeChange,
}: OhlcChartProps) => {
  const colors = useChartPalette({ backgroundOverride: betaBackgroundColor })

  const errorMessage = t`Unable to fetch "${selectChartList?.find(c => c.key === selectedChartKey)?.label ?? ''}" data.`

  return (
    <Stack direction="column">
      <ChartStateWrapper
        height={chartHeight}
        isLoading={isLoading}
        error={error}
        errorMessage={errorMessage}
        refreshData={refetchPricesData}
      >
        <CandleChart
          hideCandleSeriesLabel={hideCandleSeriesLabel}
          chartHeight={chartHeight}
          ohlcData={ohlcData}
          oraclePriceData={oraclePriceData}
          liquidationRange={liquidationRange}
          timeOption={timeOption}
          colors={colors}
          fetchMoreChartData={fetchMoreChartData}
          liqRangeCurrentVisible={liqRangeCurrentVisible}
          liqRangeNewVisible={liqRangeNewVisible}
          oraclePriceVisible={oraclePriceVisible}
          latestOraclePrice={latestOraclePrice}
          onVisiblePriceRangeChange={onVisiblePriceRangeChange}
        />
      </ChartStateWrapper>
    </Stack>
  )
}
