import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useEffect, useMemo, memo, useRef } from 'react'
import { BandsChartToken, ChartDataPoint, ParsedBandsBalances } from '@/llamalend/features/bands-chart/types'
import { Box, Skeleton } from '@mui/material'
import { DEFAULT_CHART_HEIGHT } from '@ui-kit/features/candle-chart/constants'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'
import { ErrorMessage } from '@ui-kit/shared/ui/ErrorMessage'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { getChartOptions } from './chartOptions'
import { EmptyState } from './EmptyState'
import { useBandsChartPalette } from './hooks/useBandsChartPalette'
import { useBandsChartTooltip } from './hooks/useBandsChartTooltip'
import { useBandsChartZoom } from './hooks/useBandsChartZoom'
import { useDerivedChartData } from './hooks/useDerivedChartData'
import { useInitialZoomIndices } from './hooks/useInitialZoomIndices'
import { useUserBandsPriceRange } from './hooks/useUserBandsPriceRange'

type BandsChartProps = {
  collateralToken: BandsChartToken
  borrowToken: BandsChartToken
  chartData: ChartDataPoint[]
  isError: boolean
  isLoading: boolean
  userBandsBalances: ParsedBandsBalances[]
  oraclePrice?: string
  height?: number
}

/**
 * BandsChart - Visualizes bands for lending markets
 *
 * Shows stacked bar chart with:
 * - Market collateral distribution across price bands
 * - User position liquidation range
 * - User price line markers for start and end of liquidation range
 * - Oracle price line marker
 */
const BandsChartComponent = ({
  collateralToken,
  borrowToken,
  chartData,
  isError,
  isLoading,
  userBandsBalances,
  oraclePrice,
  height = DEFAULT_CHART_HEIGHT,
}: BandsChartProps) => {
  const palette = useBandsChartPalette()
  const chartRef = useRef<ReactECharts | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const derived = useDerivedChartData(chartData)
  const initialZoomIndices = useInitialZoomIndices(chartData, userBandsBalances, oraclePrice)
  const userBandsPriceRange = useUserBandsPriceRange(chartData, userBandsBalances)
  const tooltipFormatter = useBandsChartTooltip(chartData, collateralToken, borrowToken)
  const option: EChartsOption = useMemo(
    () => getChartOptions(chartData, derived, userBandsPriceRange, oraclePrice, palette, tooltipFormatter),
    [chartData, derived, userBandsPriceRange, oraclePrice, palette, tooltipFormatter],
  )
  const { option: finalOption, onDataZoom } = useBandsChartZoom({
    option,
    chartDataLength: chartData.length,
    initialZoomIndices,
    userBandsBalances,
    chartData,
  })

  // Ensure the chart resizes on window resize and on initial mount (e.g., after layout/visibility changes)
  useEffect(() => {
    const handleResize = () => {
      const instance = chartRef.current?.getEchartsInstance?.()
      instance?.resize()
    }
    window.addEventListener('resize', handleResize)
    // Trigger once after mount in case the container measured after paint
    requestAnimationFrame(handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Observe container size changes (covers layout changes not tied to window resize)
  const containerDimensions = useResizeObserver(containerRef)
  useEffect(() => {
    if (!containerDimensions) return
    const instance = chartRef.current?.getEchartsInstance?.()
    instance?.resize()
  }, [containerDimensions, height])

  if (!chartData?.length) {
    return (
      <Box sx={{ width: '100%', fontVariantNumeric: 'tabular-nums', height }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {isLoading ? (
            <Skeleton variant="rectangular" sx={{ width: '100%', height: '100%' }} />
          ) : (
            <EmptyState isError={isError} />
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        fontVariantNumeric: 'tabular-nums',
        width: '100%',
        minHeight: `${height}px`,
        height,
        minWidth: 0,
      }}
    >
      <ErrorBoundary
        title="Chart Error"
        customErrorComponent={({ error }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <ErrorMessage
              title="An error ocurred"
              subtitle="Something went wrong when rendering the bands chart."
              error={error}
            />
          </Box>
        )}
      >
        <ReactECharts
          ref={chartRef}
          option={finalOption}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'canvas' }}
          onEvents={{ datazoom: onDataZoom }}
          notMerge={true}
          lazyUpdate={true}
          autoResize={true}
        />
      </ErrorBoundary>
    </Box>
  )
}

/**
 * Memoized export to prevent unnecessary re-renders when parent components update
 */
export const BandsChart = memo(BandsChartComponent)
