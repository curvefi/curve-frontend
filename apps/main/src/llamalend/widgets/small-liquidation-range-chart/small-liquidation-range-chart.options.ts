import type { EChartsOption, GridComponentOption, XAXisComponentOption, YAXisComponentOption } from 'echarts'
import { CHART_LINE_WIDTHS } from '@ui-kit/shared/ui/Chart/chart.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { buildOracleMarkerSeries } from './oracle-marker-series'
import {
  CHART_LAYOUT,
  FULL_RANGE_Y_AXIS,
  INSET_RANGE_Y_AXIS,
  NEW_RANGE_BORDER_DASH,
  RANGE_LABEL,
  SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS,
  SPLIT_ORACLE_RAIL,
} from './small-liquidation-range-chart.constants'
import type {
  BuildOptionContext,
  ChartColors,
  ChartTextStyle,
  RangeMarkArea,
  RangeSeriesParams,
  RenderableLiquidationRange,
  SmallLiquidationRangeChartLayout,
  SplitLayout,
} from './small-liquidation-range-chart.types'

const { FontWeight } = SizesAndSpaces

const buildBaseOption = ({ chartTextStyle }: Pick<BuildOptionContext, 'chartTextStyle'>) => ({
  animation: false,
  textStyle: {
    fontFamily: chartTextStyle.fontFamily,
  },
})

const buildContinuousGrid = (): GridComponentOption => ({
  left: 0,
  top: CHART_LAYOUT.rangeBorderGutter,
  right: 0,
  bottom: CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter,
})

const buildHiddenYAxis = (gridIndex?: number): YAXisComponentOption => ({
  type: 'value',
  min: 0,
  max: 1,
  show: false,
  ...(gridIndex === undefined ? {} : { gridIndex }),
})

// The visible chart is markArea + marker. This invisible line series gives ECharts
// a coordinate system that markArea can attach to without drawing an actual line.
const buildRangeSeries = ({ rangeMarkAreas, seriesData }: RangeSeriesParams) => ({
  type: 'line' as const,
  data: seriesData,
  showSymbol: false,
  silent: true,
  lineStyle: { opacity: 0 },
  markArea: {
    silent: true,
    data: rangeMarkAreas,
  },
})

// Shared real-price value axis used by continuous mode and by the main range axis in split mode.
const buildValueAxis = ({
  colors,
  domain,
  gridIndex,
  hasChartData,
  alignMinLabel = 'left',
  alignMaxLabel = 'right',
  showMinLabel = true,
  showMaxLabel = true,
  textStyle,
}: {
  colors: ChartColors
  domain?: readonly [number, number]
  gridIndex?: number
  hasChartData: boolean
  alignMinLabel?: 'left' | 'center'
  alignMaxLabel?: 'right' | 'center'
  showMinLabel?: boolean
  showMaxLabel?: boolean
  textStyle: ChartTextStyle
}): XAXisComponentOption => ({
  type: 'value',
  min: domain?.[0],
  max: domain?.[1],
  ...(gridIndex === undefined ? {} : { gridIndex }),
  axisLine: {
    onZero: false,
    lineStyle: { color: colors.axisLine },
  },
  axisTick: {
    length: CHART_LAYOUT.priceMarker.tickHeight,
    lineStyle: { color: colors.axisLine },
  },
  splitLine: { show: false },
  axisLabel: {
    fontFamily: textStyle.fontFamily,
    fontSize: textStyle.fontSize,
    fontWeight: textStyle.fontWeight,
    lineHeight: textStyle.lineHeight,
    show: hasChartData,
    showMinLabel,
    showMaxLabel,
    alignMinLabel,
    alignMaxLabel,
    color: colors.axisLabel,
    hideOverlap: true,
    margin: CHART_LAYOUT.priceMarker.labelGap,
    formatter: (tick: number) => `${formatNumber(tick, { abbreviate: true, maximumSignificantDigits: 3 })}`,
  },
})

// The oracle rail is a second x-axis with synthetic coordinates. Only its labels communicate
// the truncated scale: blank handoff edge, "..." break label, and rounded terminal tick.
const buildOracleRailAxis = ({
  colors,
  layout,
  terminalTickLabel,
  textStyle,
}: {
  colors: ChartColors
  layout: SplitLayout
  terminalTickLabel: string
  textStyle: ChartTextStyle
}): XAXisComponentOption => ({
  type: 'value',
  gridIndex: 1,
  min: SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS.min,
  max: SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS.max,
  interval: 1,
  axisLine: {
    onZero: false,
    lineStyle: { color: colors.axisLine },
  },
  axisTick: {
    length: CHART_LAYOUT.priceMarker.tickHeight,
    lineStyle: { color: colors.axisLine },
  },
  splitLine: { show: false },
  axisLabel: {
    fontFamily: textStyle.fontFamily,
    fontSize: textStyle.fontSize,
    fontWeight: textStyle.fontWeight,
    lineHeight: textStyle.lineHeight,
    color: colors.axisLabel,
    hideOverlap: false,
    margin: CHART_LAYOUT.priceMarker.labelGap,
    showMinLabel: true,
    showMaxLabel: true,
    alignMinLabel: 'left' as const,
    alignMaxLabel: 'right' as const,
    formatter: (tick: number) => {
      if (tick === SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS.breakTick) return '...'

      // Only the outer rail edge gets a numeric label; the inner edge visually stitches
      // to the real-price axis and must stay blank.
      const isTerminalTick =
        (layout.mode === 'split-left' && tick === SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS.min) ||
        (layout.mode === 'split-right' && tick === SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS.max)

      return isTerminalTick ? terminalTickLabel : ''
    },
  },
})

// Grid index 0 always carries the real liquidation-range scale; grid index 1 is the compact oracle rail.
// Mirroring the grid order keeps the rail on whichever side the distant oracle lives on.
const buildSplitGrids = (layout: SplitLayout): GridComponentOption[] =>
  layout.mode === 'split-left'
    ? [
        {
          left: SPLIT_ORACLE_RAIL.width,
          right: 0,
          top: CHART_LAYOUT.rangeBorderGutter,
          bottom: CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter,
        },
        {
          left: 0,
          width: SPLIT_ORACLE_RAIL.width,
          top: CHART_LAYOUT.rangeBorderGutter,
          bottom: CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter,
        },
      ]
    : [
        {
          left: 0,
          right: SPLIT_ORACLE_RAIL.width,
          top: CHART_LAYOUT.rangeBorderGutter,
          bottom: CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter,
        },
        {
          right: 0,
          width: SPLIT_ORACLE_RAIL.width,
          top: CHART_LAYOUT.rangeBorderGutter,
          bottom: CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter,
        },
      ]

const getSplitOracleMarkerPosition = (layout: SplitLayout) => {
  const { breakTick, max, min } = SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS

  return layout.mode === 'split-left'
    ? Math.max(min, Math.min(layout.oracleRail.markerPosition, breakTick - SPLIT_ORACLE_RAIL.markerBreakGap))
    : Math.min(max, Math.max(layout.oracleRail.markerPosition, breakTick + SPLIT_ORACLE_RAIL.markerBreakGap))
}

export const buildRangeMarkAreas = ({
  colors,
  currentRange,
  hasNewRange,
  newRange,
  textStyle,
}: {
  colors: ChartColors
  currentRange?: RenderableLiquidationRange
  hasNewRange: boolean
  newRange?: RenderableLiquidationRange
  textStyle: ChartTextStyle
}) => {
  const rangeLabelStyle = {
    fontFamily: textStyle.fontFamily,
    fontSize: textStyle.fontSize,
    fontWeight: FontWeight.Semi_Bold,
    lineHeight: textStyle.lineHeight,
  }

  return [
    ...(currentRange
      ? [
          [
            {
              xAxis: currentRange[0],
              yAxis: FULL_RANGE_Y_AXIS[0],
              z2: 1,
              itemStyle: { color: colors.currentRange },
              label: {
                ...rangeLabelStyle,
                show: !hasNewRange,
                position: 'inside',
                formatter: RANGE_LABEL,
                color: colors.rangeLabel,
              },
            },
            { xAxis: currentRange[1], yAxis: FULL_RANGE_Y_AXIS[1] },
          ] as RangeMarkArea,
        ]
      : []),
    ...(newRange
      ? [
          [
            {
              xAxis: newRange[0],
              yAxis: INSET_RANGE_Y_AXIS[0],
              z2: 2,
              itemStyle: {
                color: 'transparent',
                borderColor: colors.newRangeLine,
                borderType: NEW_RANGE_BORDER_DASH,
                borderWidth: CHART_LINE_WIDTHS.referenceLine,
              },
              label: {
                ...rangeLabelStyle,
                show: true,
                position: 'inside',
                formatter: RANGE_LABEL,
                color: colors.newRangeLine,
              },
            },
            { xAxis: newRange[1], yAxis: INSET_RANGE_Y_AXIS[1] },
          ] as RangeMarkArea,
        ]
      : []),
  ]
}

// Continuous mode is a normal real-price chart: range endpoints and oracle all share one axis.
export const buildContinuousOption = ({
  chartLayout,
  chartTextStyle,
  colors,
  formattedOraclePrice,
  hasChartData,
  htmlFontSize,
  oraclePrice,
  rangeMarkAreas,
  seriesData,
}: BuildOptionContext & {
  chartLayout?: SmallLiquidationRangeChartLayout
}): EChartsOption => ({
  ...buildBaseOption({ chartTextStyle }),
  grid: buildContinuousGrid(),
  xAxis: buildValueAxis({
    colors,
    domain: chartLayout?.mainDomain,
    hasChartData,
    textStyle: chartTextStyle,
  }),
  yAxis: buildHiddenYAxis(),
  series: [
    buildRangeSeries({ rangeMarkAreas, seriesData }),
    ...(oraclePrice === undefined
      ? []
      : [
          buildOracleMarkerSeries({
            colors,
            formattedOraclePrice,
            htmlFontSize,
            markerXValue: oraclePrice,
            textStyle: chartTextStyle,
          }),
        ]),
  ],
})

// Split mode intentionally avoids ECharts' native xAxis.breaks renderer.
//
// Native breaks are useful when the broken section should still behave like a compressed
// part of the same numeric axis. This widget has a different job: preserve detail in the
// liquidation range while also indicating that the oracle price is far outside it.
// For that compact summary view we need:
// - no break-area shape drawn through the shallow chart track
// - one explicit "..." handoff label and one rounded terminal tick
// - an oracle marker positioned on the truncated rail while its label shows the real price
// - a main range axis determined only by liquidation range endpoints, not by a distant oracle
//
// Two grids/axes give us that presentation while still keeping everything inside ECharts'
// coordinate system instead of layering external DOM over the chart.
export const buildSplitOption = ({
  chartLayout,
  chartTextStyle,
  colors,
  formattedOraclePrice,
  hasChartData,
  htmlFontSize,
  oraclePrice,
  rangeMarkAreas,
  seriesData,
}: BuildOptionContext & {
  chartLayout: SplitLayout
}): EChartsOption => {
  const rangeSeries = buildRangeSeries({ rangeMarkAreas, seriesData })
  const terminalTickLabel = formatNumber(chartLayout.oracleRail.terminalTick, { abbreviate: true }) ?? ''

  return {
    ...buildBaseOption({ chartTextStyle }),
    grid: buildSplitGrids(chartLayout),
    xAxis: [
      buildValueAxis({
        colors,
        domain: chartLayout.mainDomain,
        gridIndex: 0,
        hasChartData,
        ...(chartLayout.mode === 'split-left'
          ? { alignMinLabel: 'center' as const }
          : { alignMaxLabel: 'center' as const }),
        textStyle: chartTextStyle,
      }),
      buildOracleRailAxis({
        colors,
        layout: chartLayout,
        terminalTickLabel,
        textStyle: chartTextStyle,
      }),
    ],
    yAxis: [buildHiddenYAxis(0), buildHiddenYAxis(1)],
    series: [
      // Ranges stay on the real price axis.
      {
        ...rangeSeries,
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      ...(oraclePrice === undefined
        ? []
        : [
            buildOracleMarkerSeries({
              colors,
              formattedOraclePrice,
              htmlFontSize,
              // The marker uses the synthetic rail coordinate; its label still shows the real oracle price.
              markerXValue: getSplitOracleMarkerPosition(chartLayout),
              textStyle: chartTextStyle,
              xAxisIndex: 1,
              yAxisIndex: 1,
            }),
          ]),
    ],
  }
}
