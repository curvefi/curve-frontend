import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useEffect, useMemo, useRef, memo } from 'react'
import Spinner, { SpinnerWrapper } from 'ui/src/Spinner'
import { ChartDataPoint, ParsedBandsBalances } from '@/llamalend/features/bands-chart/types'
import { Token } from '@/llamalend/features/borrow/types'
import { Box, Stack } from '@mui/material'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import { Slider } from '@ui-kit/shared/ui/Slider'
import { getChartOptions } from './chartOptions'
import { EmptyState } from './EmptyState'
import { useBandsChartPalette } from './hooks/useBandsChartPalette'
import { useBandsChartTooltip } from './hooks/useBandsChartTooltip'
import { useBandsChartZoom } from './hooks/useBandsChartZoom'
import { useDerivedChartData } from './hooks/useDerivedChartData'
import { useInitialZoomIndices } from './hooks/useInitialZoomIndices'
import { useUserBandsPriceRange } from './hooks/useUserBandsPriceRange'

type BandsChartProps = {
  collateralToken?: Token
  borrowToken?: Token
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
  height = 420, // TODO: set correct default value when the combined chart header (OHLC chart + bands chart) is implemented
}: BandsChartProps) => {
  const chartRef = useRef<ReactECharts | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const palette = useBandsChartPalette()
  const derived = useDerivedChartData(chartData)
  const initialZoomIndices = useInitialZoomIndices(chartData, userBandsBalances, oraclePrice)
  const userBandsPriceRange = useUserBandsPriceRange(chartData, userBandsBalances)
  const tooltipFormatter = useBandsChartTooltip(chartData, collateralToken, borrowToken)
  const priceMin = useMemo(() => chartData.length && Math.min(...chartData.map((d) => d.p_down)), [chartData])
  const priceMax = useMemo(() => chartData.length && Math.max(...chartData.map((d) => d.p_up)), [chartData])
  const option: EChartsOption = useMemo(
    () => getChartOptions(chartData, derived, userBandsPriceRange, oraclePrice, palette, tooltipFormatter),
    [chartData, derived, userBandsPriceRange, oraclePrice, palette, tooltipFormatter],
  )
  const {
    option: finalOption,
    onDataZoom,
    zoomRange,
    setZoomRange,
  } = useBandsChartZoom({
    option,
    chartDataLength: chartData.length,
    initialZoomIndices,
    userBandsBalances,
    chartData,
  })

  const containerDimensions = useResizeObserver(containerRef, { threshold: 0 })

  useEffect(() => {
    const instance = chartRef.current?.getEchartsInstance?.()
    if (!instance || !containerDimensions) return

    const [width, height] = containerDimensions
    if (width > 0 && height > 0) {
      instance.resize({ width, height })
    }
  }, [containerDimensions])

  useEffect(() => {
    const instance = chartRef.current?.getEchartsInstance?.()
    if (!instance) return
    instance.resize()
  }, [height, finalOption])

  if (!chartData?.length) {
    return (
      <Box sx={{ width: '100%', fontVariantNumeric: 'tabular-nums', height }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: '14px',
            color: palette.textColor,
          }}
        >
          {isLoading ? (
            // TODO: update when re-theming the candle chart to match spinners
            <SpinnerWrapper>
              <Spinner size={18} />
            </SpinnerWrapper>
          ) : (
            <EmptyState isError={isError} />
          )}
        </Box>
      </Box>
    )
  }

  const rawValues: [number, number] = [
    typeof zoomRange.startValue === 'number' ? zoomRange.startValue : priceMin,
    typeof zoomRange.endValue === 'number' ? zoomRange.endValue : priceMax,
  ]
  const normalizedValues = rawValues.sort((a, b) => a - b) as [number, number]

  return (
    <Stack
      direction="row"
      sx={{ width: '100%', minHeight: `${height}px`, height, gap: 2, minWidth: 0, alignItems: 'stretch' }}
    >
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          fontVariantNumeric: 'tabular-nums',
          flex: 1,
          minWidth: 0,
          height: '100%',
          '& *': { cursor: 'default' },
        }}
      >
        <ReactECharts
          ref={chartRef}
          option={finalOption}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'canvas' }}
          onEvents={{ datazoom: onDataZoom }}
          notMerge={true}
          lazyUpdate={true}
          autoResize={false}
        />
      </Box>
      <Slider
        orientation="vertical"
        size="small"
        value={normalizedValues}
        min={priceMin}
        max={priceMax}
        onChange={(_e, val) => {
          if (Array.isArray(val)) {
            const [minV, maxV] = val.sort((a, b) => a - b)
            setZoomRange({ startValue: minV, endValue: maxV })
          }
        }}
        onChangeCommitted={(_e, val) => {
          if (Array.isArray(val)) {
            const [minV, maxV] = val.sort((a, b) => a - b)
            setZoomRange({ startValue: minV, endValue: maxV })
          }
        }}
        data-rail-background="filled"
        sx={{
          // disable MUI's default padding for coarse touch devices to match design
          '@media (pointer: coarse)': {
            padding: `0`,
          },
        }}
      />
    </Stack>
  )
}

/**
 * Memoized export to prevent unnecessary re-renders when parent components update
 */
export const BandsChart = memo(BandsChartComponent)
