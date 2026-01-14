import { useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { CandleChart } from '@ui-kit/features/candle-chart/CandleChart'
import { ErrorMessage } from '@ui-kit/features/candle-chart/ErrorMessage'
import { useChartPalette } from '@ui-kit/features/candle-chart/hooks/useChartPalette'
import type { ChartSelections } from '@ui-kit/shared/ui/ChartHeader'
import { Spinner } from '@ui-kit/shared/ui/Spinner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { FetchingStatus, LiquidationRanges, LpPriceOhlcDataFormatted, OraclePriceData, TimeOption } from './types'

const { Spacing } = SizesAndSpaces

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

  return (
    <Stack direction="column">
      {chartStatus === 'READY' && (
        <Box
          ref={wrapperRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            width: '100%',
            minHeight: chartHeight,
            paddingBottom: Spacing.sm,
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
      )}
      {chartStatus === 'LOADING' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: chartHeight,
            gap: Spacing.md,
          }}
        >
          <Spinner />
        </Box>
      )}
      {chartStatus === 'ERROR' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: chartHeight,
            gap: Spacing.md,
          }}
        >
          <ErrorMessage
            errorMessage={`Unable to fetch ${selectChartList?.find((c) => c.key === selectedChartKey)?.label ?? ''} data.`}
            refreshData={refetchPricesData}
          />
        </Box>
      )}
    </Stack>
  )
}
