import { useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { CandleChart } from '@ui-kit/features/candle-chart/CandleChart'
import { useChartPalette } from '@ui-kit/features/candle-chart/hooks/useChartPalette'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart'
import type { ChartSelections } from '@ui-kit/shared/ui/Chart/ChartHeader'
import type { FetchingStatus, LiquidationRanges, LpPriceOhlcDataFormatted, OraclePriceData, TimeOption } from './types'

export type OhlcChartProps = {
  /**
   * If the chart is used on a Llamalend market page we hide the candle series label and label line.
   */
  hideCandleSeriesLabel: boolean
  chartHeight: number
  chartStatus: FetchingStatus
  betaBackgroundColor?: string // Used during the beta phase of the new theme migration to pass theme bg color
  ohlcData: LpPriceOhlcDataFormatted[]
  oraclePriceData?: OraclePriceData[]
  liquidationRange?: LiquidationRanges
  selectedChartKey: string
  timeOption: TimeOption
  refetchPricesData: () => void
  fetchMoreChartData: (lastFetchEndTime: number) => void
  oraclePriceVisible?: boolean
  liqRangeCurrentVisible?: boolean
  liqRangeNewVisible?: boolean
  lastFetchEndTime: number
  refetchingCapped: boolean
  selectChartList: ChartSelections[]
  latestOraclePrice?: string
}

export const ChartWrapper = ({
  hideCandleSeriesLabel,
  chartHeight,
  chartStatus,
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
  lastFetchEndTime,
  refetchingCapped,
  selectChartList,
  latestOraclePrice,
}: OhlcChartProps) => {
  const clonedOhlcData = useMemo(() => [...ohlcData], [ohlcData])
  const wrapperRef = useRef(null)
  const colors = useChartPalette({ backgroundOverride: betaBackgroundColor })

  const isError = chartStatus === 'ERROR'
  const errorMessage = `Unable to fetch "${selectChartList?.find((c) => c.key === selectedChartKey)?.label ?? ''}" data.`
  const error = useMemo(() => (isError ? new Error(errorMessage) : null), [isError, errorMessage]) // todo: pass correct error from query instead of creating new error with message

  return (
    <Stack direction="column">
      <ChartStateWrapper
        height={chartHeight}
        isLoading={chartStatus === 'LOADING'}
        error={error}
        errorMessage={errorMessage}
        refetchFunction={refetchPricesData}
      >
        <Box
          ref={wrapperRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: chartHeight,
            position: 'relative',
          }}
        >
          <CandleChart
            hideCandleSeriesLabel={hideCandleSeriesLabel}
            chartHeight={chartHeight}
            ohlcData={clonedOhlcData}
            oraclePriceData={oraclePriceData}
            liquidationRange={liquidationRange}
            timeOption={timeOption}
            wrapperRef={wrapperRef}
            colors={colors}
            refetchingCapped={refetchingCapped}
            fetchMoreChartData={fetchMoreChartData}
            lastFetchEndTime={lastFetchEndTime}
            liqRangeCurrentVisible={liqRangeCurrentVisible}
            liqRangeNewVisible={liqRangeNewVisible}
            oraclePriceVisible={oraclePriceVisible}
            latestOraclePrice={latestOraclePrice}
          />
        </Box>
      </ChartStateWrapper>
    </Stack>
  )
}
