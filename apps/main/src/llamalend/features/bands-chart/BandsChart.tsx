import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo, useRef, useCallback, useState, useEffect, memo } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import Spinner, { SpinnerWrapper } from 'ui/src/Spinner'
import { ChartDataPoint, ParsedBandsBalances, BandsChartPalette } from '@/llamalend/features/bands-chart/types'
import { Token } from '@/llamalend/features/borrow/types'
import { Box, Stack, useTheme, ThemeProvider, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { DesignSystem } from '@ui-kit/themes/design'
import { getChartOptions } from './chartOptions'
import { useDerivedChartData } from './hooks/useDerivedChartData'
import { useInitialZoomIndices } from './hooks/useInitialZoomIndices'
import { useUserBandsPriceRange } from './hooks/useUserBandsPriceRange'
import { TooltipContent } from './TooltipContent'

type BandsChartProps = {
  collateralToken?: Token
  borrowToken?: Token
  chartData: ChartDataPoint[]
  isLoading: boolean
  userBandsBalances: ParsedBandsBalances[]
  oraclePrice?: string
  height?: number
}

type TooltipParams = {
  dataIndex: number
}[]

/**
 * BandsChart - Visualizes liquidity bands for lending markets
 *
 * Shows stacked bar chart with:
 * - Market collateral distribution across price bands
 * - User's specific positions
 * - Liquidation zones and oracle price markers
 */
const BandsChartComponent = ({
  collateralToken,
  borrowToken,
  chartData,
  isLoading,
  userBandsBalances,
  oraclePrice,
  height = 500,
}: BandsChartProps) => {
  const [initialZoom, setInitialZoom] = useState<{ start?: number; end?: number }>({})
  const theme = useTheme()

  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<ReactECharts | null>(null)
  const tooltipRootRef = useRef<Root | null>(null)

  const { theme: currentThemeName } = theme.design
  const invertedDesign = useMemo(() => DesignSystem[currentThemeName]({ inverted: true }), [currentThemeName])

  const palette: BandsChartPalette = useMemo(
    () => ({
      backgroundColor: theme.design.Layer[1].Fill,
      textColor: theme.design.Text.TextColors.Primary,
      textColorInverted: invertedDesign.Text.TextColors.Primary,
      gridColor: theme.design.Color.Neutral[300],
      marketBandColor: theme.design.Color.Neutral[300],
      userBandColor: theme.design.Color.Neutral[500],
      borderColor: theme.design.Layer[1].Outline,
      userRangeHighlightColor: theme.design.Color.Tertiary[200],
      userRangeLabelBackgroundColor: theme.design.Color.Tertiary[300],
      oraclePriceLineColor: theme.design.Color.Primary[500],
      liquidationBandOutlineColor: theme.design.Color.Tertiary[600],
    }),
    [theme.design, invertedDesign],
  )

  const derived = useDerivedChartData(chartData)
  const initialZoomIndices = useInitialZoomIndices(chartData, userBandsBalances, oraclePrice)
  const userBandsPriceRange = useUserBandsPriceRange(chartData, userBandsBalances)

  /**
   * Custom tooltip formatter for ECharts
   * ECharts doesn't support React components directly, so we create a DOM element
   * and render React into it. The root is reused across renders for performance.
   */
  const tooltipFormatter = useCallback(
    (params: unknown) => {
      // Initialize tooltip container and React root on first render
      if (!tooltipRef.current) {
        tooltipRef.current = document.createElement('div')
        tooltipRootRef.current = createRoot(tooltipRef.current)
      }

      const typedParams = params as TooltipParams
      const dataPoint =
        Array.isArray(typedParams) && typedParams.length > 0 ? chartData[typedParams[0].dataIndex] : null

      // Render tooltip content or clear it
      if (dataPoint && tooltipRootRef.current) {
        tooltipRootRef.current.render(
          <ThemeProvider theme={theme}>
            <TooltipContent data={dataPoint} collateralToken={collateralToken} borrowToken={borrowToken} />
          </ThemeProvider>,
        )
      } else if (tooltipRootRef.current) {
        tooltipRootRef.current.render(null)
      }

      return tooltipRef.current
    },
    [chartData, collateralToken, borrowToken, theme],
  )

  const option: EChartsOption = useMemo(
    () => getChartOptions(chartData, derived, userBandsPriceRange, oraclePrice, palette, tooltipFormatter),
    [chartData, derived, userBandsPriceRange, oraclePrice, palette, tooltipFormatter],
  )

  // Calculate initial zoom range based on user bands and oracle price
  useEffect(() => {
    if (chartData.length > 0 && initialZoomIndices) {
      const start = (initialZoomIndices.startIndex / chartData.length) * 100
      const end = ((initialZoomIndices.endIndex + 1) / chartData.length) * 100
      setInitialZoom({ start, end })
    }
  }, [chartData.length, initialZoomIndices])

  // Cleanup tooltip React root on unmount to prevent memory leaks
  useEffect(
    () => () => {
      tooltipRootRef.current?.unmount()
      tooltipRootRef.current = null
      tooltipRef.current = null
    },
    [],
  )

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
          opts={{ renderer: 'svg' }}
          notMerge={true}
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
