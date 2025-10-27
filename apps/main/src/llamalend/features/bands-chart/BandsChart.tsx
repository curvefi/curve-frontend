import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo, useRef, useState, useEffect, memo } from 'react'
import Spinner, { SpinnerWrapper } from 'ui/src/Spinner'
import { ChartDataPoint, ParsedBandsBalances } from '@/llamalend/features/bands-chart/types'
import { Token } from '@/llamalend/features/borrow/types'
import { Box, Stack, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { getChartOptions } from './chartOptions'
import { useBandsChartPalette } from './hooks/useBandsChartPalette'
import { useBandsChartTooltip } from './hooks/useBandsChartTooltip'
import { useDerivedChartData } from './hooks/useDerivedChartData'
import { useInitialZoomIndices } from './hooks/useInitialZoomIndices'
import { useUserBandsPriceRange } from './hooks/useUserBandsPriceRange'

type BandsChartProps = {
  collateralToken?: Token
  borrowToken?: Token
  chartData: ChartDataPoint[]
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
  isLoading,
  userBandsBalances,
  oraclePrice,
  height = 420, // TODO: set correct default value when the combined chart header (OHLC chart + bands chart) is implemented
}: BandsChartProps) => {
  const [initialZoom, setInitialZoom] = useState<{ start?: number; end?: number }>({})
  const palette = useBandsChartPalette()
  const chartRef = useRef<ReactECharts | null>(null)
  const hasInitializedZoomRef = useRef<boolean>(false)
  const prevUserBandsRef = useRef<Set<string>>(new Set())

  const derived = useDerivedChartData(chartData)
  const initialZoomIndices = useInitialZoomIndices(chartData, userBandsBalances, oraclePrice)
  const userBandsPriceRange = useUserBandsPriceRange(chartData, userBandsBalances)
  const tooltipFormatter = useBandsChartTooltip(chartData, collateralToken, borrowToken)

  const option: EChartsOption = useMemo(
    () => getChartOptions(chartData, derived, userBandsPriceRange, oraclePrice, palette, tooltipFormatter),
    [chartData, derived, userBandsPriceRange, oraclePrice, palette, tooltipFormatter],
  )

  // Calculate initial zoom range based on user bands and oracle price
  // Only set zoom on initial mount or when user's bands change
  useEffect(() => {
    const currentUserBands = new Set(userBandsBalances.map((band) => String(band.n)))
    const prevUserBands = prevUserBandsRef.current

    // Check if bands have changed
    const bandsChanged =
      currentUserBands.size !== prevUserBands.size ||
      Array.from(currentUserBands).some((band) => !prevUserBands.has(band))

    // Apply zoom on initial mount or when user's bands change
    if (chartData.length > 0 && initialZoomIndices && (!hasInitializedZoomRef.current || bandsChanged)) {
      const start = (initialZoomIndices.startIndex / chartData.length) * 100
      const end = ((initialZoomIndices.endIndex + 1) / chartData.length) * 100
      setInitialZoom({ start, end })
      hasInitializedZoomRef.current = true
      prevUserBandsRef.current = currentUserBands
    }
  }, [chartData.length, initialZoomIndices, userBandsBalances])

  // Memoize the final chart option with dataZoom configuration
  const finalOption = useMemo(() => {
    if (!option.dataZoom) return option

    return {
      ...option,
      dataZoom: option.dataZoom.map((zoom: Record<string, unknown>) => {
        if (zoom && 'type' in zoom && zoom.type === 'slider') {
          return {
            ...zoom,
            ...(initialZoom.start != null && { start: initialZoom.start }),
            ...(initialZoom.end != null && { end: initialZoom.end }),
          }
        }
        return zoom
      }),
    }
  }, [option, initialZoom])

  if (!chartData || chartData.length === 0) {
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
            // TODO: update loading feedback when a design is available
            <SpinnerWrapper>
              <Spinner size={18} />
            </SpinnerWrapper>
          ) : (
            // TODO: replace error message when a design is available
            <Typography variant="bodyMRegular" color="textPrimary" component="div">
              {t`No bands data found...`}
            </Typography>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Stack sx={{ position: 'relative', width: '100%', minHeight: `${height}px` }}>
      <Box sx={{ width: '99%', fontVariantNumeric: 'tabular-nums', height }}>
        <ReactECharts
          ref={chartRef}
          option={finalOption}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={false}
          lazyUpdate={true}
        />
      </Box>
    </Stack>
  )
}

/**
 * Memoized export to prevent unnecessary re-renders when parent components update
 */
export const BandsChart = memo(BandsChartComponent)
