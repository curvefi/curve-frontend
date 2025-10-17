import { DataZoomComponentOption } from 'echarts'
import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import Spinner, { SpinnerWrapper } from 'ui/src/Spinner'
import { Token } from '@/llamalend/features/borrow/types'
import { ChartDataPoint, BandsBalancesData, BandsChartPalette } from '@/llamalend/widgets/bands-chart/types'
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

type DataZoomEvent = {
  start?: number
  end?: number
  batch?: { start?: number; end?: number }[]
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

  // Persist dataZoom (start/end) across renders
  const [zoom, setZoom] = useState<{ start?: number; end?: number }>({})
  const initializedZoomRef = useRef(false)
  const lastZoomRef = useRef<{ start?: number; end?: number }>({})
  const chartRef = useRef<ReactECharts | null>(null)

  useEffect(() => {
    if (!initializedZoomRef.current && chartData.length > 0 && initialZoomIndices) {
      const start = (initialZoomIndices.startIndex / chartData.length) * 100
      const end = ((initialZoomIndices.endIndex + 1) / chartData.length) * 100
      setZoom({ start, end })
      lastZoomRef.current = { start, end }
      initializedZoomRef.current = true
    }
  }, [chartData.length, initialZoomIndices])

  useEffect(() => {
    if (chartData.length === 0 || !initialZoomIndices) return

    const isFullRange =
      lastZoomRef.current.start !== undefined &&
      lastZoomRef.current.end !== undefined &&
      lastZoomRef.current.start <= 0.0001 &&
      lastZoomRef.current.end >= 99.999

    if (Object.keys(lastZoomRef.current).length === 0 || isFullRange) {
      const start = (initialZoomIndices.startIndex / chartData.length) * 100
      const end = ((initialZoomIndices.endIndex + 1) / chartData.length) * 100

      if (lastZoomRef.current.start !== start || lastZoomRef.current.end !== end) {
        setZoom({ start, end })
        lastZoomRef.current = { start, end }
      }
    }
  }, [chartData.length, userBandsBalances.length, oraclePrice, initialZoomIndices])

  const onEvents = useMemo(
    () => ({
      dataZoom: (evt: DataZoomEvent) => {
        const payload = Array.isArray(evt?.batch) && evt.batch.length ? evt.batch[0] : evt
        const s = payload?.start
        const e = payload?.end
        if (typeof s === 'number' && typeof e === 'number') {
          const prev = lastZoomRef.current
          if (prev.start !== s || prev.end !== e) {
            lastZoomRef.current = { start: s, end: e }
            setZoom({ start: s, end: e })
          }
        }
      },
    }),
    [],
  )

  const optionWithZoom: EChartsOption = useMemo(() => {
    if (option.dataZoom && Array.isArray(option.dataZoom) && zoom) {
      const dz = option.dataZoom.map((z: DataZoomComponentOption) => {
        if (z && 'type' in z && z.type === 'slider') {
          return {
            ...z,
            ...(zoom.start != null ? { start: zoom.start } : {}),
            ...(zoom.end != null ? { end: zoom.end } : {}),
          }
        }
        return z
      })
      return { ...option, dataZoom: dz }
    }
    return option
  }, [option, zoom])

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
          option={optionWithZoom}
          style={{ width: '100%', height: '100%' }}
          opts={{ renderer: 'svg' }}
          onEvents={onEvents}
          lazyUpdate
        />
      </Box>
    </Stack>
  )
}
