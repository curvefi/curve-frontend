import type { EChartsOption } from 'echarts-for-react'
import { sum, zip } from 'lodash'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { formatNumberWithOptions } from './bands-chart.utils'
import { generateMarkLines } from './markLines'
import { ChartDataPoint, BandsChartPalette, DerivedChartData, UserBandsPriceRange } from './types'

const getPriceMin = (chartData: ChartDataPoint[], oraclePrice: string | undefined) => {
  const min = Math.min(...chartData.map((d) => d.p_down))
  // bandDelta ensures padding to prevent label clipping if a label is too close to the edge
  const bandDelta = chartData[0].p_down - chartData[0].p_up
  // if oraclePrice is outside of range of bands, set min to oraclePrice - bandDelta to make sure it's visible
  if (min > Number(oraclePrice)) {
    return Number(oraclePrice) - bandDelta * 2
  }
  return min - bandDelta * 2
}

const getPriceMax = (chartData: ChartDataPoint[], oraclePrice: string | undefined) => {
  const max = Math.max(...chartData.map((d) => d.p_up))
  // bandDelta ensures padding to prevent label clipping if a label is too close to the edge
  const bandDelta = chartData[0].p_down - chartData[0].p_up
  // if oraclePrice is outside of range of bands, set max to oraclePrice + bandDelta to make sure it's visible
  if (max < Number(oraclePrice)) {
    return Number(oraclePrice) + bandDelta * 2
  }
  return max + bandDelta * 2
}

const LINE_WIDTH = 0.5

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
  animationDuration: Duration.Transition,
  animationDurationUpdate: Duration.Transition,
  animationEasingUpdate: 'cubicOut', // echarts equivalent to ease-out used in the theme
  // x encodes start, width, and computed end so the axis sees full band extent
  encode: { y: 0, x: [1, 2, 6] },
  data,
  clip: true, // Clip rectangles to grid area to prevent overflow over axis labels
  emphasis: {
    focus: 'self',
  },
  renderItem: (
    _params: unknown,
    api: {
      value: (index: number) => number
      coord: (point: number[]) => number[]
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
      style: {
        fill: color,
        stroke: isSoftLiquidationBand && enableSoftLiquidationOutline ? softLiquidationBandOutlineColor : 'transparent',
        lineWidth: isSoftLiquidationBand && enableSoftLiquidationOutline ? 1 : 0,
      },
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
  tooltipFormatter: (params: unknown) => HTMLElement | string,
): EChartsOption => {
  if (!chartData.length) return {}

  // bottom padding matches the lightweight-charts time scale spacing used by the adjacent candle chart
  const gridPadding = { left: 0, top: 0, right: 4, bottom: 7 }

  const priceMin = getPriceMin(chartData, oraclePrice)
  const priceMax = getPriceMax(chartData, oraclePrice)

  // Calculate x-axis extent for markLines (max endX value across all series)
  // data format: [median, startX, widthX, pDown, pUp, isLiq, endX]
  // endX is at index 6, and for the full extent we need marketWidth + userWidth
  const xEnd = Math.max(...zip(derived.marketData, derived.userCollateralData, derived.userBorrowedData).map(sum))
  const xStart = 0

  // Generate mark areas using exact price edges
  const markAreas = userBandsPriceRange
    ? [[{ yAxis: userBandsPriceRange.lowerBandPriceDown }, { yAxis: userBandsPriceRange.upperBandPriceUp }]]
    : []

  // Generate all mark lines (user range + oracle price) using coord format
  const markLines = generateMarkLines(userBandsPriceRange, oraclePrice, xStart, xEnd, palette)

  return {
    animationDuration: Duration.Transition,
    animationDurationUpdate: Duration.Transition,
    grid: {
      left: gridPadding.left,
      right: gridPadding.right,
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
        align: 'left',
        showMinLabel: false,
        showMaxLabel: false,
        // label margin matches the lightweight-charts time scale margin used by the adjacent candle chart
        margin: 10,
        formatter: (value: number) => formatNumberWithOptions(value),
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: palette.gridColor,
          width: LINE_WIDTH,
        },
      },
      splitNumber: 3,
    },
    yAxis: {
      position: 'right',
      axisLine: { show: false },
      axisTick: { show: false },
      axisPointer: {
        show: true,
        type: 'shadow',
        snap: true,
        label: {
          show: false,
        },
      },
      axisLabel: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      min: priceMin,
      max: priceMax,
    },
    series: (() => {
      const marketSeriesData: Array<[number, number, number, number, number, number, number]> = []
      const userCollateralSeriesData: Array<[number, number, number, number, number, number, number]> = []
      const userBorrowedSeriesData: Array<[number, number, number, number, number, number, number]> = []
      const outlineSeriesData: Array<[number, number, number, number, number, number, number]> = []
      for (let i = 0; i < chartData.length; i++) {
        const d = chartData[i]
        const median = d.pUpDownMedian
        const pDown = d.p_down
        const pUp = d.p_up
        const isLiq = derived.isLiquidation[i] ? 1 : 0
        const marketWidth = derived.marketData[i] ?? 0
        const userCollateralWidth = derived.userCollateralData[i] ?? 0
        const userBorrowedWidth = derived.userBorrowedData[i] ?? 0
        const totalWidth = marketWidth + userCollateralWidth + userBorrowedWidth
        marketSeriesData.push([median, 0, totalWidth, pDown, pUp, isLiq, totalWidth])
        userCollateralSeriesData.push([median, 0, userCollateralWidth, pDown, pUp, isLiq, userCollateralWidth])
        userBorrowedSeriesData.push([
          median,
          userCollateralWidth,
          userBorrowedWidth,
          pDown,
          pUp,
          isLiq,
          userCollateralWidth + userBorrowedWidth,
        ])
        outlineSeriesData.push([median, 0, totalWidth, pDown, pUp, isLiq, totalWidth])
      }

      const marketSeries = createCustomRectSeries(
        'Market Collateral',
        palette.marketBandColor,
        palette.liquidationBandOutlineColor,
        marketSeriesData,
        false,
        markAreas.length
          ? { silent: true, itemStyle: { color: palette.userRangeBackgroundColor }, data: markAreas }
          : undefined,
        markLines.length
          ? {
              animation: false,
              animationDuration: 0,
              animationDurationUpdate: 0,
              symbol: 'none',
              label: { show: false },
              data: markLines.map((line) => {
                const [startPoint, endPoint] = line
                return [{ ...startPoint }, { ...endPoint, lineStyle: line.lineStyle }]
              }),
            }
          : undefined,
      )

      const userCollateralSeries = createCustomRectSeries(
        'User Collateral',
        palette.userCollateralShareColor,
        palette.liquidationBandOutlineColor,
        userCollateralSeriesData,
        false,
      )

      const userBorrowedSeries = createCustomRectSeries(
        'User Borrowed',
        palette.userBorrowedShareColor,
        palette.liquidationBandOutlineColor,
        userBorrowedSeriesData,
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

      return [marketSeries, userCollateralSeries, userBorrowedSeries, outlineSeries]
    })(),
  }
}
