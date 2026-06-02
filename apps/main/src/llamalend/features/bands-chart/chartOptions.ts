import { sum, zip } from 'lodash'
import { formatChartAxisNumber } from '@ui-kit/shared/ui/Chart'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { generateOracleReferenceLines, generateRangeBoundaryLines, type HorizontalLine } from './horizontalLines'
import type {
  BandsChartOption,
  BandsChartPalette,
  BandsChartSeriesType,
  BandsRangeOverlay,
  ChartDataPoint,
  DerivedChartData,
  HorizontalLineSeriesData,
  RangeSeriesData,
  RectSeriesData,
} from './types'
import { BANDS_CHART_SERIES_TYPE } from './types'

const getOverlayPrices = (rangeOverlays: BandsRangeOverlay[]) =>
  rangeOverlays.flatMap(({ lowerPrice, upperPrice }) => [lowerPrice, upperPrice])

const getPriceMin = (
  chartData: ChartDataPoint[],
  oraclePrice: string | undefined,
  rangeOverlays: BandsRangeOverlay[],
) => {
  const rangePrices = getOverlayPrices(rangeOverlays)
  const oraclePriceValues = oraclePrice ? [Number(oraclePrice)] : []
  const min = Math.min(...chartData.map(d => d.p_down), ...rangePrices, ...oraclePriceValues)
  // bandDelta ensures padding to prevent label clipping if a label is too close to the edge
  const bandDelta = chartData[0].p_down - chartData[0].p_up
  // if oraclePrice is outside of range of bands, include it so it stays visible
  return min - bandDelta * 2
}

const getPriceMax = (
  chartData: ChartDataPoint[],
  oraclePrice: string | undefined,
  rangeOverlays: BandsRangeOverlay[],
) => {
  const rangePrices = getOverlayPrices(rangeOverlays)
  const oraclePriceValues = oraclePrice ? [Number(oraclePrice)] : []
  const max = Math.max(...chartData.map(d => d.p_up), ...rangePrices, ...oraclePriceValues)
  // bandDelta ensures padding to prevent label clipping if a label is too close to the edge
  const bandDelta = chartData[0].p_down - chartData[0].p_up
  // if oraclePrice is outside of range of bands, include it so it stays visible
  return max + bandDelta * 2
}

const LINE_WIDTH = 0.5
const [ENABLE_OUTLINE, DISABLE_OUTLINE] = [true, false]

// ECharts renders larger z values above smaller ones. The current range lines
// need to sit above bands for readability, but lines inside the new range are
// filtered below so the new range still owns overlap cases.
const CHART_LAYER = {
  currentRangeArea: 0,
  newRangeArea: 2,
  marketBands: 3,
  userBands: 4,
  softLiquidationOutline: 5,
  currentRangeLine: 6,
  newRangeLine: 7,
  oracleLine: 8,
} as const

type NativeMarkLineOption = {
  animation: false
  animationDuration: 0
  animationDurationUpdate: 0
  symbol: 'none'
  label: { show: false }
  z2: number
  data: [{ coord: [number, number] }, { coord: [number, number]; lineStyle: HorizontalLine['lineStyle'] }][]
}

//
// Custom series renderer to draw a rectangle spanning [p_down, p_up] with a given width and start offset.
// Data value layout per item: [median, startX, widthX, p_down, p_up, isLiquidationNumeric, endX]
//
const createCustomRectSeries = (
  name: string,
  color: string,
  softLiquidationBandOutlineColor: string,
  data: RectSeriesData,
  enableSoftLiquidationOutline: boolean,
) => ({
  name,
  type: 'custom' as const,
  bandsChartSeriesType: BANDS_CHART_SERIES_TYPE.band satisfies BandsChartSeriesType,
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
})

const createNativeOracleMarkLineOption = (lines: HorizontalLine[], z2: number) =>
  lines.length
    ? ({
        animation: false,
        animationDuration: 0,
        animationDurationUpdate: 0,
        symbol: 'none',
        label: { show: false },
        z2,
        data: lines.map(line => {
          const { startPoint, endPoint } = line
          return [{ ...startPoint }, { ...endPoint, lineStyle: line.lineStyle }]
        }),
      } satisfies NativeMarkLineOption)
    : undefined

const createNativeOracleLineSeries = (
  name: string,
  data: RectSeriesData,
  z: number,
  markLine?: NativeMarkLineOption,
) => ({
  name,
  type: 'custom' as const,
  bandsChartSeriesType: BANDS_CHART_SERIES_TYPE.oracleLine satisfies BandsChartSeriesType,
  animationDuration: Duration.Transition,
  animationDurationUpdate: Duration.Transition,
  encode: { y: 0, x: [1, 2, 6] },
  data,
  silent: true,
  tooltip: { show: false },
  z,
  renderItem: () => null,
  ...(markLine && { markLine }),
})

const createHorizontalLineSeriesData = (lines: HorizontalLine[]): HorizontalLineSeriesData =>
  lines.map(({ startPoint, endPoint }) => [startPoint.coord[0], endPoint.coord[0], startPoint.coord[1]])

// Current range boundaries should remain visible over bands, but not cut across
// a proposed/new range. Inclusive bounds make exact boundary matches defer to
// the new range line.
const excludeLinesInsideRangeOverlays = (
  lines: HorizontalLine[],
  rangeOverlays: BandsRangeOverlay[],
): HorizontalLine[] =>
  lines.filter(({ startPoint }) => {
    const price = startPoint.coord[1]
    return !rangeOverlays.some(({ lowerPrice, upperPrice }) => price >= lowerPrice && price <= upperPrice)
  })

// Range boundaries are custom series instead of ECharts markLine because markLine
// can escape the custom-series z-order when current/new ranges overlap.
const createRangeBoundaryLineSeries = (name: string, lines: HorizontalLine[], z: number) => ({
  name,
  type: 'custom' as const,
  bandsChartSeriesType: BANDS_CHART_SERIES_TYPE.rangeLine satisfies BandsChartSeriesType,
  animationDuration: Duration.Transition,
  animationDurationUpdate: Duration.Transition,
  encode: { x: [0, 1], y: 2 },
  data: createHorizontalLineSeriesData(lines),
  silent: true,
  tooltip: { show: false },
  clip: true,
  z,
  renderItem: (
    params: { dataIndex: number },
    api: {
      value: (index: number) => number
      coord: (point: number[]) => number[]
    },
  ) => {
    const xStartValue = api.value(0)
    const xEndValue = api.value(1)
    const price = api.value(2)
    const start = api.coord([xStartValue, price])
    const end = api.coord([xEndValue, price])
    const lineStyle = lines[params.dataIndex].lineStyle

    return {
      type: 'line',
      shape: { x1: start[0], y1: start[1], x2: end[0], y2: end[1] },
      style: {
        stroke: lineStyle.color,
        lineWidth: lineStyle.width,
        lineDash: lineStyle.type,
      },
    }
  },
})

const createRangeSeriesData = (
  { lowerPrice, upperPrice }: BandsRangeOverlay,
  xStart: number,
  xEnd: number,
): RangeSeriesData => [[xStart, xEnd, lowerPrice, upperPrice]]

const createRangeAreaSeries = (
  name: string,
  rangeOverlay: BandsRangeOverlay,
  xStart: number,
  xEnd: number,
  z: number,
) => ({
  name,
  type: 'custom' as const,
  bandsChartSeriesType: BANDS_CHART_SERIES_TYPE.rangeArea satisfies BandsChartSeriesType,
  animationDuration: Duration.Transition,
  animationDurationUpdate: Duration.Transition,
  encode: { x: [0, 1], y: [2, 3] },
  data: createRangeSeriesData(rangeOverlay, xStart, xEnd),
  silent: true,
  tooltip: { show: false },
  clip: true,
  z,
  renderItem: (
    _params: unknown,
    api: {
      value: (index: number) => number
      coord: (point: number[]) => number[]
    },
  ) => {
    const xStartValue = api.value(0)
    const xEndValue = api.value(1)
    const lowerPrice = api.value(2)
    const upperPrice = api.value(3)
    const topLeft = api.coord([xStartValue, upperPrice])
    const topRight = api.coord([xEndValue, upperPrice])
    const bottomLeft = api.coord([xStartValue, lowerPrice])

    return {
      type: 'rect',
      shape: {
        x: Math.min(topLeft[0], topRight[0]),
        y: Math.min(topLeft[1], bottomLeft[1]),
        width: Math.abs(topRight[0] - topLeft[0]),
        height: Math.abs(bottomLeft[1] - topLeft[1]),
      },
      style: {
        fill: rangeOverlay.backgroundColor,
      },
    }
  },
})

/**
 * Generates complete ECharts configuration for bands visualization
 */
export const getChartOptions = (
  chartData: ChartDataPoint[],
  derived: DerivedChartData,
  rangeOverlays: BandsRangeOverlay[],
  oraclePrice: string | undefined,
  palette: BandsChartPalette,
  tooltipFormatter: (params: unknown) => HTMLElement | string,
): BandsChartOption => {
  if (!chartData.length) return {}

  // bottom padding matches the lightweight-charts time scale spacing used by the adjacent candle chart
  const gridPadding = { left: 0, top: 0, right: 4, bottom: 7 }

  const priceMin = getPriceMin(chartData, oraclePrice, rangeOverlays)
  const priceMax = getPriceMax(chartData, oraclePrice, rangeOverlays)

  // Calculate x-axis extent for horizontal lines (max endX value across all series)
  // data format: [median, startX, widthX, pDown, pUp, isLiq, endX]
  // endX is at index 6, and for the full extent we need marketWidth + userWidth
  const xEnd = Math.max(...zip(derived.marketData, derived.userCollateralData, derived.userBorrowedData).map(sum))
  const xStart = 0

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
        formatter: (value: number) => formatChartAxisNumber(value),
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
      const marketSeriesData: RectSeriesData = []
      const userCollateralSeriesData: RectSeriesData = []
      const userBorrowedSeriesData: RectSeriesData = []
      const outlineSeriesData: RectSeriesData = []
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

      const currentRangeOverlays = rangeOverlays.filter(({ variant }) => variant === 'current')
      const newRangeOverlays = rangeOverlays.filter(({ variant }) => variant === 'new')

      // Areas are custom series instead of markArea so their z-order can sit precisely
      // between other custom band layers. ECharts markArea would otherwise fight the
      // band/line stacking rules used by this chart.
      const currentRangeAreaSeries = currentRangeOverlays.map((rangeOverlay, index) =>
        createRangeAreaSeries(
          `Current Liquidation Range Area ${index + 1}`,
          rangeOverlay,
          xStart,
          xEnd,
          CHART_LAYER.currentRangeArea,
        ),
      )

      const currentRangeLineSeries = currentRangeOverlays.map((rangeOverlay, index) =>
        createRangeBoundaryLineSeries(
          `Current Liquidation Range Line ${index + 1}`,
          excludeLinesInsideRangeOverlays(generateRangeBoundaryLines(rangeOverlay, xStart, xEnd), newRangeOverlays),
          CHART_LAYER.currentRangeLine,
        ),
      )

      // New range area is intentionally below the bands; the lines for the same range are
      // added later above the band layers so the preview bounds remain fully visible.
      const newRangeAreaSeries = newRangeOverlays.map((rangeOverlay, index) =>
        createRangeAreaSeries(
          `New Liquidation Range Area ${index + 1}`,
          rangeOverlay,
          xStart,
          xEnd,
          CHART_LAYER.newRangeArea,
        ),
      )

      const marketSeries = {
        ...createCustomRectSeries(
          'Market Collateral',
          palette.marketBandColor,
          palette.liquidationBandOutlineColor,
          marketSeriesData,
          DISABLE_OUTLINE,
        ),
        z: CHART_LAYER.marketBands,
      }

      const userCollateralSeries = {
        ...createCustomRectSeries(
          'User Collateral',
          palette.userCollateralShareColor,
          palette.liquidationBandOutlineColor,
          userCollateralSeriesData,
          DISABLE_OUTLINE,
        ),
        z: CHART_LAYER.userBands,
      }

      const userBorrowedSeries = {
        ...createCustomRectSeries(
          'User Borrowed',
          palette.userBorrowedShareColor,
          palette.liquidationBandOutlineColor,
          userBorrowedSeriesData,
          DISABLE_OUTLINE,
        ),
        z: CHART_LAYER.userBands,
      }

      const outlineSeries = {
        ...createCustomRectSeries(
          'Soft Liquidation Outline',
          'transparent',
          palette.liquidationBandOutlineColor,
          outlineSeriesData,
          ENABLE_OUTLINE,
        ),
        silent: true,
        z: CHART_LAYER.softLiquidationOutline,
        emphasis: { disabled: true },
      }

      // These line-only series are rendered after the bands with a higher z value. That keeps
      // the new liquidation range visible even when the proposed range overlaps user bands.
      const newRangeLineSeries = newRangeOverlays.map((rangeOverlay, index) =>
        createRangeBoundaryLineSeries(
          `New Liquidation Range Line ${index + 1}`,
          generateRangeBoundaryLines(rangeOverlay, xStart, xEnd),
          CHART_LAYER.newRangeLine,
        ),
      )

      const nativeOracleMarkLine = createNativeOracleMarkLineOption(
        generateOracleReferenceLines(oraclePrice, xStart, xEnd, palette),
        CHART_LAYER.oracleLine,
      )
      const oracleLineSeries = nativeOracleMarkLine
        ? [
            createNativeOracleLineSeries(
              'Oracle Price Line',
              outlineSeriesData,
              CHART_LAYER.oracleLine,
              nativeOracleMarkLine,
            ),
          ]
        : []

      return [
        ...currentRangeAreaSeries,
        ...currentRangeLineSeries,
        ...newRangeAreaSeries,
        marketSeries,
        userCollateralSeries,
        userBorrowedSeries,
        outlineSeries,
        ...newRangeLineSeries,
        ...oracleLineSeries,
      ]
    })(),
  }
}
