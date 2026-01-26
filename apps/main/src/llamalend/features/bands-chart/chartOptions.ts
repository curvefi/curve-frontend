import type { EChartsOption } from 'echarts-for-react'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { getPriceMin, getPriceMax, formatNumberWithOptions } from './bands-chart.utils'
import { generateMarkLines, createLabelStyle } from './markLines'
import { ChartDataPoint, BandsChartPalette, DerivedChartData, UserBandsPriceRange } from './types'

//
// Custom series renderer to draw a rectangle spanning [p_down, p_up] with a given width and start offset.
// Data value layout per item: [median, startX, widthX, p_down, p_up, isLiquidationNumeric, endX]
//
const createCustomRectSeries = (
  name: string,
  color: string,
  softLiquidationBandOutlineColor: string,
  data: Array<[number, number, number, number, number, number, number]>,
  enableSoftLiquidationOutline: boolean,
  markArea?: Record<string, unknown> | null,
  markLine?: Record<string, unknown> | null,
) => ({
  name,
  type: 'custom' as const,
  animation: true,
  animationDuration: Duration.Transition,
  animationDurationUpdate: Duration.Transition,
  animationEasingUpdate: 'cubicOut', // echarts equivalent to ease-out used in the theme
  // x encodes start, width, and computed end so the axis sees full band extent
  encode: { y: 0, x: [1, 2, 6] },
  data,
  clip: true, // Clip rectangles to grid area to prevent overflow over axis labels
  emphasis: {
    focus: 'self',
    itemStyle: {
      opacity: 1,
    },
  },
  renderItem: (
    _params: unknown,
    api: {
      value: (index: number) => number
      coord: (point: number[]) => number[]
      style: (opts: Record<string, unknown>) => Record<string, unknown>
    },
  ) => {
    const startX = api.value(1)
    const widthX = api.value(2)
    // lower edge of band price range
    const pDown = api.value(3)
    // upper edge of band price range
    const pUp = api.value(4)
    const isSoftLiquidationBand = api.value(5) === 1

    // Do not render when the logical width is zero or negative
    if (!widthX || widthX <= 0) return null

    const topLeft = api.coord([startX, pUp])
    const topRight = api.coord([startX + widthX, pUp])
    const bottomLeft = api.coord([startX, pDown])

    const axisEdgeX = Math.max(topLeft[0], topRight[0])
    let left = Math.min(topLeft[0], topRight[0])
    const top = Math.min(topLeft[1], bottomLeft[1])
    let width = axisEdgeX - left
    const height = Math.abs(bottomLeft[1] - topLeft[1])

    // Ensure minimal pixel width/height for visibility when zoomed out
    const minWidthPx = 3
    const minHeightPx = 3
    if (width < minWidthPx) {
      left = axisEdgeX - minWidthPx
      width = minWidthPx
    }

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
        stroke: isSoftLiquidationBand && enableSoftLiquidationOutline ? softLiquidationBandOutlineColor : 'transparent',
        lineWidth: isSoftLiquidationBand && enableSoftLiquidationOutline ? 2 : 0,
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
  const gridPadding = { left: 0, top: 0, bottom: 8 }
  const gridRight = 16 + dataZoomWidth
  const labelXOffset = 16 - (gridRight - dataZoomWidth)

  const priceMin = getPriceMin(chartData, oraclePrice)
  const priceMax = getPriceMax(chartData, oraclePrice)

  // Calculate x-axis extent for markLines (max endX value across all series)
  // Data format: [median, startX, widthX, pDown, pUp, isLiq, endX]
  // endX is at index 6, and for the full extent we need marketWidth + userWidth
  let maxXEnd = 0
  for (let i = 0; i < chartData.length; i++) {
    const marketWidth = derived.marketData[i] ?? 0
    const userWidth = derived.userData[i] ?? 0
    const endX = marketWidth + userWidth
    maxXEnd = Math.max(maxXEnd, endX)
  }
  const xStart = 0
  const xEnd = maxXEnd

  // Generate mark areas using exact price edges
  const markAreas = userBandsPriceRange
    ? [[{ yAxis: userBandsPriceRange.lowerBandPriceDown }, { yAxis: userBandsPriceRange.upperBandPriceUp }]]
    : []

  // Generate all mark lines (user range + oracle price) using coord format
  const markLines = generateMarkLines(chartData, userBandsPriceRange, oraclePrice, xStart, xEnd, palette)

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: Duration.Transition,
    animationDurationUpdate: Duration.Transition,
    animationEasingUpdate: 'cubicOut', // echarts equivalent to ease-out used in the theme
    grid: {
      left: gridPadding.left,
      right: gridRight,
      top: gridPadding.top,
      bottom: gridPadding.bottom,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        axis: 'y',
        snap: true,
        triggerTooltip: true,
        shadowStyle: {
          opacity: 0.1,
        },
      },
      formatter: tooltipFormatter,
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      // ECharts sets white-space: nowrap on the tooltip container by default; override to allow wrapping
      extraCssText:
        'white-space: normal; overflow-wrap: anywhere; word-break: break-word; max-width: none !important; width: max-content !important;',
      confine: false,
      // Only show tooltip when there's actual data at the hovered position
      triggerOn: 'mousemove',
    },
    xAxis: {
      type: 'value',
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisPointer: { show: false },
      axisLabel: {
        color: palette.scaleLabelsColor,
        hideOverlap: true,
        interval: 'auto',
        overflow: 'break',
        showMinLabel: true,
        showMaxLabel: false,
        margin: 8,
        formatter: (value: number) => formatNumberWithOptions(value),
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: palette.gridColor,
          type: 'solid',
        },
      },
    },
    yAxis: {
      type: 'value',
      position: 'right',
      axisLine: { show: false },
      axisTick: { show: false },
      overflow: 'hide',
      axisPointer: {
        show: true,
        type: 'shadow',
        snap: true,
        label: {
          show: true,
          formatter: (params: { value: unknown }) => formatNumberWithOptions(Number(params.value)),
          padding: [2, 4],
          borderRadius: 0,
          backgroundColor: palette.oraclePriceLineColor,
        },
      },
      axisLabel: {
        color: palette.scaleLabelsColor,
        hideOverlap: true,
        overflow: 'break',
        showMinLabel: false,
        showMaxLabel: false,
        formatter: (value: number) => formatNumberWithOptions(value),
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: palette.gridColor,
          type: 'solid',
        },
      },
      min: priceMin,
      max: priceMax,
    },
    series: (() => {
      const marketSeriesData: Array<[number, number, number, number, number, number, number]> = []
      const userSeriesData: Array<[number, number, number, number, number, number, number]> = []
      const outlineSeriesData: Array<[number, number, number, number, number, number, number]> = []
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
        marketSeriesData.push([median, marketStart, marketWidth, pDown, pUp, isLiq, marketStart + marketWidth])
        userSeriesData.push([median, userStart, userWidth, pDown, pUp, isLiq, userStart + userWidth])
        outlineSeriesData.push([
          median,
          marketStart,
          marketWidth + userWidth,
          pDown,
          pUp,
          isLiq,
          marketStart + marketWidth + userWidth,
        ])
      }

      const marketSeries = createCustomRectSeries(
        'Market Collateral',
        palette.marketBandColor,
        palette.liquidationBandOutlineColor,
        marketSeriesData,
        false,
        markAreas.length > 0
          ? { silent: true, itemStyle: { color: palette.userRangeHighlightColor }, data: markAreas }
          : undefined,
        markLines.length > 0
          ? {
              animation: false,
              animationDuration: 0,
              animationDurationUpdate: 0,
              silent: false,
              symbol: 'none',
              data: markLines.map((line) => {
                const [startPoint, endPoint] = line
                return [
                  {
                    ...startPoint,
                    label: {
                      ...startPoint.label,
                      position: 'start',
                      align: 'left',
                      verticalAlign: 'middle',
                      offset: [-labelXOffset, 0],
                      ...createLabelStyle(line.lineStyle, palette),
                    },
                  },
                  {
                    ...endPoint,
                    lineStyle: line.lineStyle,
                  },
                ]
              }),
            }
          : undefined,
      )

      const userSeries = createCustomRectSeries(
        'User Collateral',
        palette.userBandColor,
        palette.liquidationBandOutlineColor,
        userSeriesData,
        false,
      )

      const outlineSeries = {
        ...createCustomRectSeries(
          'Soft Liquidation Outline',
          'transparent',
          palette.liquidationBandOutlineColor,
          outlineSeriesData,
          true,
        ),
        silent: true,
        z: 2,
        emphasis: { disabled: true },
      }

      return [marketSeries, userSeries, outlineSeries]
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
        handleStyle: { color: palette.zoomThumbColor, borderColor: palette.zoomThumbHandleBorderColor },
        showDetail: false,
        labelFormatter: (value: number | string) => formatNumberWithOptions(Number(value)),
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
        // Prevent filtering of markLines when zooming
        filterMode: 'none',
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        orient: 'vertical',
        zoomOnMouseWheel: 'shift',
        moveOnMouseWheel: true,
        // Prevent filtering of markLines when zooming
        filterMode: 'none',
      },
    ],
  }
}
