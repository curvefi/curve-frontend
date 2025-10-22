import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo, useRef, useCallback, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import Spinner, { SpinnerWrapper } from 'ui/src/Spinner'
import { ChartDataPoint, BandsBalancesData, BandsChartPalette } from '@/llamalend/features/bands-chart/types'
import { Token } from '@/llamalend/features/borrow/types'
import { Box, Stack, useTheme, ThemeProvider } from '@mui/material'
import { DesignSystem } from '@ui-kit/themes/design'
import { getChartOptions } from './chartOptions'
import { TooltipContent } from './TooltipContent'
import { useBandsChartCalculations } from './useBandsChartCalculations'
import { findBandIndexByPrice, findClosestBandIndex } from './utils'

type BandsChartProps = {
  collateralToken?: Token
  borrowToken?: Token
  chartData: ChartDataPoint[]
  userBandsBalances: BandsBalancesData[]
  liquidationBand: number | null | undefined
  oraclePrice: string | undefined
  oraclePriceBand: number | null | undefined
  height?: number
}

export const BandsChart = ({
  collateralToken,
  borrowToken,
  chartData,
  userBandsBalances,
  liquidationBand,
  oraclePrice,
  oraclePriceBand,
  height = 500,
}: BandsChartProps) => {
  const theme = useTheme()
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const tooltipRootRef = useRef<any>(null)
  const { theme: currentThemeName } = theme.design
  const invertedDesign = DesignSystem[currentThemeName]({ inverted: true })

  const backgroundColor = theme.design.Layer[1].Fill
  const textColor = theme.design.Text.TextColors.Primary
  const textColorInverted = invertedDesign.Text.TextColors.Primary
  const gridColor = theme.design.Color.Neutral[300]
  const marketBandColor = theme.design.Color.Neutral[300]
  const userBandColor = theme.design.Color.Neutral[500]
  const borderColor = theme.design.Layer[1].Outline
  const userRangeHighlightColor = theme.design.Color.Tertiary[200]
  const userRangeLabelBackgroundColor = theme.design.Color.Tertiary[300]
  const oraclePriceLineColor = theme.design.Color.Primary[500]
  const liquidationBandOutlineColor = theme.design.Color.Tertiary[600]

  const palette: BandsChartPalette = useMemo(
    () => ({
      backgroundColor,
      textColor,
      textColorInverted,
      gridColor,
      marketBandColor,
      userBandColor,
      borderColor,
      userRangeHighlightColor,
      userRangeLabelBackgroundColor,
      oraclePriceLineColor,
      liquidationBandOutlineColor,
    }),
    [
      backgroundColor,
      textColor,
      textColorInverted,
      gridColor,
      marketBandColor,
      userBandColor,
      borderColor,
      userRangeHighlightColor,
      userRangeLabelBackgroundColor,
      oraclePriceLineColor,
      liquidationBandOutlineColor,
    ],
  )

  const { userBandsPriceRange, derived, initialZoomIndices } = useBandsChartCalculations(
    chartData,
    userBandsBalances,
    oraclePrice,
  )

  const defaultBrushWindow = 50
  const hasBrush = chartData.length > defaultBrushWindow

  const tooltipFormatter = useCallback(
    (params: any) => {
      if (!tooltipRef.current) {
        tooltipRef.current = document.createElement('div')
        tooltipRootRef.current = createRoot(tooltipRef.current)
      }

      const dataPoint = Array.isArray(params) && params.length > 0 ? chartData[params[0].dataIndex] : null

      if (dataPoint) {
        tooltipRootRef.current.render(
          <ThemeProvider theme={theme}>
            <TooltipContent data={dataPoint} collateralToken={collateralToken} borrowToken={borrowToken} />
          </ThemeProvider>,
        )
      } else {
        tooltipRootRef.current.render(null)
      }

      return tooltipRef.current
    },
    [chartData, collateralToken, borrowToken, theme],
  )

  const option: EChartsOption = useMemo(
    () =>
      getChartOptions(
        chartData,
        derived,
        hasBrush,
        userBandsPriceRange,
        oraclePrice,
        palette,
        collateralToken,
        borrowToken,
        findBandIndexByPrice,
        findClosestBandIndex,
        tooltipFormatter,
      ),
    [
      chartData,
      derived,
      hasBrush,
      userBandsPriceRange,
      oraclePrice,
      palette,
      collateralToken,
      borrowToken,
      tooltipFormatter,
    ],
  )

  const [initialZoom, setInitialZoom] = useState<{ start?: number; end?: number }>({})

  useEffect(() => {
    if (chartData.length > 0 && initialZoomIndices) {
      const start = (initialZoomIndices.startIndex / chartData.length) * 100
      const end = ((initialZoomIndices.endIndex + 1) / chartData.length) * 100
      setInitialZoom({ start, end })
    }
  }, [chartData.length, initialZoomIndices])

  const chartRef = useRef<ReactECharts | null>(null)

  if (chartData.length === 0) {
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
          <SpinnerWrapper>
            <Spinner size={18} />
          </SpinnerWrapper>
        </Box>
      </Box>
    )
  }

  return (
    <Stack sx={{ position: 'relative', width: '100%', minHeight: `${height}px` }}>
      <Box sx={{ width: '99%', fontVariantNumeric: 'tabular-nums', height }}>
        <ReactECharts
          ref={chartRef}
          option={{
            ...option,
            dataZoom: option.dataZoom?.map((z: any) => {
              if (z && 'type' in z && z.type === 'slider') {
                return {
                  ...z,
                  ...(initialZoom.start != null ? { start: initialZoom.start } : {}),
                  ...(initialZoom.end != null ? { end: initialZoom.end } : {}),
                }
              }
              return z
            }),
          }}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'canvas' }}
          lazyUpdate
        />
      </Box>
    </Stack>
  )
}
