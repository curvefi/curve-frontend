import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useEffect, useMemo, memo, useRef } from 'react'
import { BandsChartToken, ChartDataPoint, ParsedBandsBalances } from '@/llamalend/features/bands-chart/types'
import { Box, useTheme } from '@mui/material'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'
import { t } from '@ui-kit/lib/i18n'
import { ChartStateWrapper } from '@ui-kit/shared/ui/Chart/ChartStateWrapper'
import { useEChartsTooltip } from '@ui-kit/shared/ui/Chart/hooks/useEChartsTooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getChartOptions } from './chartOptions'
import { useBandsChartPalette } from './hooks/useBandsChartPalette'
import { useBandsChartZoom } from './hooks/useBandsChartZoom'
import { useDerivedChartData } from './hooks/useDerivedChartData'
import { useUserBandsPriceRange } from './hooks/useUserBandsPriceRange'
import { TooltipContent } from './TooltipContent'

const { Height } = SizesAndSpaces

type BandsChartProps = {
  collateralToken: BandsChartToken
  borrowToken: BandsChartToken
  chartData: ChartDataPoint[]
  error: Error | null
  isLoading: boolean
  userBandsBalances: ParsedBandsBalances[]
  oraclePrice?: string
  height?: number
  priceRange?: { min: number; max: number }
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
  error,
  isLoading,
  userBandsBalances,
  oraclePrice,
  height = Height.chart,
  priceRange,
}: BandsChartProps) => {
  const palette = useBandsChartPalette()
  const chartRef = useRef<ReactECharts | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const derived = useDerivedChartData(chartData)
  const userBandsPriceRange = useUserBandsPriceRange(chartData, userBandsBalances)
  const theme = useTheme()
  const tooltipFormatter = useEChartsTooltip(chartData, theme, (data) => (
    <TooltipContent data={data} collateralToken={collateralToken} borrowToken={borrowToken} />
  ))
  const option: EChartsOption = useMemo(
    () => getChartOptions(chartData, derived, userBandsPriceRange, oraclePrice, palette, tooltipFormatter),
    [chartData, derived, userBandsPriceRange, oraclePrice, palette, tooltipFormatter],
  )
  const finalOption = useBandsChartZoom({ option, priceRange, chartData, derived })

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
      <ChartStateWrapper
        height={height}
        isLoading={isLoading || !chartData?.length}
        error={error}
        errorMessage={t`Failed to load bands chart data`}
      >
        <ReactECharts
          ref={chartRef}
          option={finalOption}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
          lazyUpdate={true}
          autoResize={true}
        />
      </ChartStateWrapper>
    </Box>
  )
}

/**
 * Memoized export to prevent unnecessary re-renders when parent components update
 */
export const BandsChart = memo(BandsChartComponent)
