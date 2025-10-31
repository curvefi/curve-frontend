import type { EChartsOption } from 'echarts-for-react'
import { formatNumber } from '@ui/utils'
import { generateMarkLines, createLabelStyle } from './markLines'
import { ChartDataPoint, BandsChartPalette, DerivedChartData, UserBandsPriceRange } from './types'

//
// Custom series renderer to draw a rectangle spanning [p_down, p_up] with a given width and start offset.
// Data value layout per item: [median, startX, widthX, p_down, p_up, isLiquidationNumeric]
//
const createCustomRectSeries = (
  name: string,
  color: string,
  outlineColor: string,
  data: Array<[number, number, number, number, number, number]>,
  markArea?: Record<string, unknown> | null,
  markLine?: Record<string, unknown> | null,
) => ({
  name,
  type: 'custom' as const,
  animation: false,
  clip: false,
  encode: { y: 0 },
  data,
  emphasis: {
    focus: 'self',
    itemStyle: {
      opacity: 1,
    },
  },
  renderItem: (_params: unknown, api: any) => {
    const startX = api.value(1)
    const widthX = api.value(2)
    const pDown = api.value(3)
    const pUp = api.value(4)
    const isLiq = api.value(5) === 1

    // Do not render when the logical width is zero or negative
    if (!widthX || widthX <= 0) return null

    const tl = api.coord([startX, pUp])
    const tr = api.coord([startX + widthX, pUp])
    const bl = api.coord([startX, pDown])

    const left = Math.min(tl[0], tr[0])
    const top = Math.min(tl[1], bl[1])
    let width = Math.abs(tr[0] - tl[0])
    const height = Math.abs(bl[1] - tl[1])

    // Ensure minimal pixel width/height for visibility when zoomed out
    const minWidthPx = 3
    const minHeightPx = 3
    if (width < minWidthPx) width = minWidthPx

    // Adaptive vertical gap: keep spacing but never collapse band below min height
    const desiredGap = 1
    const maxGap = Math.max(0, (height - minHeightPx) / 2)
    const effectiveGap = Math.min(desiredGap, maxGap)
    const paddedTop = top + effectiveGap
    const paddedHeight = Math.max(minHeightPx, height - effectiveGap * 2)

    return {
      type: 'rect',
      shape: { x: left, y: paddedTop, width, height: paddedHeight },
      style: api.style({
        fill: color,
        stroke: isLiq ? outlineColor : 'transparent',
        lineWidth: isLiq ? 2 : 0,
      }),
    }
  },
  ...(markArea && { markArea }),
  ...(markLine && { markLine }),
})

/**
 * Generates complete ECharts configuration for bands visualization
 */
export const getChartOptions = (
  chartData: ChartDataPoint[],
  derived: DerivedChartData,
  userBandsPriceRange: UserBandsPriceRange,
  oraclePrice: string | undefined,
  palette: BandsChartPalette,
  tooltipFormatter: (params: unknown) => HTMLElement,
): EChartsOption => {
  if (chartData.length === 0) return {}

  const dataZoomWidth = 20
  const gridPadding = { left: 0, top: 16, bottom: 16 }
  const gridRight = 16 + dataZoomWidth
  const labelXOffset = 16 - (gridRight - dataZoomWidth)

  // Secondary value y-axis will mirror category spacing using index space
  // Price domain for value y-axis
  const priceMin = Math.min(...chartData.map((d) => d.p_down))
  const priceMax = Math.max(...chartData.map((d) => d.p_up))

  // Generate mark areas using exact price edges
  const markAreas = userBandsPriceRange
    ? [[{ yAxis: userBandsPriceRange.lowerBandPriceDown }, { yAxis: userBandsPriceRange.upperBandPriceUp }]]
    : []

  // Generate all mark lines (user range + oracle price)
  const markLines = generateMarkLines(chartData, userBandsPriceRange, oraclePrice, palette)

  return {
    backgroundColor: 'transparent',
    animation: false,
    grid: {
      left: gridPadding.left,
      right: gridRight,
      top: gridPadding.top,
      bottom: gridPadding.bottom,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', axis: 'y', snap: true },
      formatter: tooltipFormatter,
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
    },
    xAxis: {
      type: 'value',
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisPointer: { show: false },
      axisLabel: {
        color: palette.scaleLabelsColor,
        fontSize: 12,
        hideOverlap: true,
        interval: 'auto',
        margin: 8,
        formatter: (value: number) => `$${formatNumber(value, { notation: 'compact' })}`,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: palette.gridColor,
          opacity: 0.5,
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'value',
      position: 'right',
      inverse: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisPointer: {
        show: true,
        type: 'shadow',
        snap: true,
        label: {
          show: true,
          margin: 6,
          formatter: (params: any) => `$${formatNumber(Number(params.value), { unit: 'dollar' })}`,
        },
      },
      axisLabel: {
        color: palette.scaleLabelsColor,
        fontSize: 12,
        formatter: (value: number | string) => `$${formatNumber(Number(value), { notation: 'compact' })}`,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: palette.gridColor,
          opacity: 0.5,
          type: 'dashed',
        },
      },
      min: priceMin,
      max: priceMax,
    },
    series: (() => {
      const marketSeriesData: Array<[number, number, number, number, number, number]> = []
      const userSeriesData: Array<[number, number, number, number, number, number]> = []
      for (let i = 0; i < chartData.length; i++) {
        const d = chartData[i]
        const median = d.pUpDownMedian
        const pDown = d.p_down
        const pUp = d.p_up
        const isLiq = derived.isLiquidation[i] ? 1 : 0
        const marketWidth = derived.marketData[i] ?? 0
        const userWidth = derived.userData[i] ?? 0
        const marketStart = 0
        const userStart = marketWidth
        marketSeriesData.push([median, marketStart, marketWidth, pDown, pUp, isLiq])
        userSeriesData.push([median, userStart, userWidth, pDown, pUp, isLiq])
      }

      const marketSeries = createCustomRectSeries(
        'Market Collateral',
        palette.marketBandColor,
        palette.liquidationBandOutlineColor,
        marketSeriesData,
        markAreas.length > 0
          ? { silent: true, itemStyle: { color: palette.userRangeHighlightColor }, data: markAreas }
          : undefined,
        markLines.length > 0
          ? {
              silent: false,
              symbol: 'none',
              lineStyle: { width: 2 },
              data: markLines.map((line) => ({
                ...line,
                label: {
                  ...line.label,
                  position: 'start',
                  align: 'left',
                  verticalAlign: 'middle',
                  offset: [-labelXOffset, 0],
                  ...createLabelStyle(line.lineStyle, palette),
                },
              })),
            }
          : undefined,
      )

      const userSeries = createCustomRectSeries(
        'User Collateral',
        palette.userBandColor,
        palette.liquidationBandOutlineColor,
        userSeriesData,
      )

      return [marketSeries, userSeries]
    })(),
    dataZoom: [
      {
        type: 'slider',
        yAxisIndex: 0,
        orient: 'vertical',
        right: 10,
        width: dataZoomWidth,
        brushSelect: false,
        showDataShadow: false,
        borderColor: 'none',
        backgroundColor: palette.zoomTrackBackgroundColor,
        fillerColor: palette.zoomThumbColor,
        handleSize: '100%',
        handleStyle: { color: palette.zoomThumbColor, borderColor: palette.textColorInverted },
        textStyle: { color: palette.textColorInverted, fontSize: 10 },
        labelFormatter: (value: number | string) => `$${formatNumber(Number(value), { notation: 'compact' })}`,
        dataBackground: {
          lineStyle: {
            color: palette.gridColor,
            opacity: 0.5,
          },
          areaStyle: {
            color: palette.gridColor,
            opacity: 0.2,
          },
        },
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        orient: 'vertical',
        zoomOnMouseWheel: 'shift',
        moveOnMouseWheel: true,
      },
    ],
  }
}
