import type { EChartsOption } from 'echarts-for-react'
import { CHART_LINE_WIDTHS } from '@ui-kit/shared/ui/Chart/chart.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { buildOracleMarkerSeries } from './oracle-marker-series'
import {
  CHART_LAYOUT,
  FULL_RANGE_Y_AXIS,
  NEW_RANGE_BORDER_DASH,
  RANGE_LABEL,
  SPLIT_GRID,
} from './small-liquidation-range-chart.constants'
import type {
  BuildOptionContext,
  ChartColors,
  ChartTextStyle,
  RangeMarkArea,
  RangeSeriesParams,
  RenderableLiquidationRange,
  SplitLayout,
} from './small-liquidation-range-chart.types'
import {
  SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS,
  type SmallLiquidationRangeChartLayout,
} from './small-liquidation-range-chart.utils'

const { FontWeight } = SizesAndSpaces

type ValueAxisOption = {
  type: 'value'
  min?: number
  max?: number
  gridIndex?: number
  axisLine: {
    onZero: false
    lineStyle: { color: string }
  }
  axisTick: {
    length: number
    lineStyle: { color: string }
  }
  splitLine: { show: false }
  axisLabel: {
    fontFamily: string
    fontSize: number
    fontWeight: string | number
    lineHeight: number
    show: boolean
    showMinLabel: true
    showMaxLabel: true
    alignMinLabel: 'left' | 'center'
    alignMaxLabel: 'right' | 'center'
    color: string
    hideOverlap: true
    margin: number
    formatter: (tick: number) => string
  }
}

const buildBaseOption = ({ chartTextStyle }: Pick<BuildOptionContext, 'chartTextStyle'>) => ({
  animation: false,
  textStyle: {
    fontFamily: chartTextStyle.fontFamily,
  },
})

const buildContinuousGrid = () => ({
  left: 0,
  top: CHART_LAYOUT.rangeBorderGutter,
  right: 0,
  bottom: CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter,
})

const buildHiddenYAxis = (gridIndex?: number) => ({
  type: 'value' as const,
  min: 0,
  max: 1,
  show: false,
  ...(gridIndex === undefined ? {} : { gridIndex }),
})

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

const buildValueAxis = ({
  colors,
  domain,
  gridIndex,
  hasChartData,
  alignMinLabel = 'left',
  alignMaxLabel = 'right',
  textStyle,
}: {
  colors: ChartColors
  domain?: readonly [number, number]
  gridIndex?: number
  hasChartData: boolean
  alignMinLabel?: 'left' | 'center'
  alignMaxLabel?: 'right' | 'center'
  textStyle: ChartTextStyle
}): ValueAxisOption => ({
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
    showMinLabel: true,
    showMaxLabel: true,
    alignMinLabel,
    alignMaxLabel,
    color: colors.axisLabel,
    hideOverlap: true,
    margin: CHART_LAYOUT.priceMarker.labelGap,
    formatter: (tick: number) => `${formatNumber(tick, { abbreviate: true })}`,
  },
})

// The oracle rail is a second x-axis with synthetic coordinates; only its labels communicate the truncated scale.
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
}) => ({
  // Synthetic three-tick axis:
  //   boundary with real scale | "..." break | rounded terminal tick.
  // The oracle marker is rendered separately so its value label does not distort the scale labels.
  type: 'value' as const,
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
    hideOverlap: true,
    margin: CHART_LAYOUT.priceMarker.labelGap,
    showMinLabel: true,
    showMaxLabel: true,
    alignMinLabel: 'left' as const,
    alignMaxLabel: 'right' as const,
    formatter: (tick: number) => {
      if (tick === SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS.breakTick) return '...'

      return (layout.mode === 'split-left' && tick === SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS.min) ||
        (layout.mode === 'split-right' && tick === SMALL_LIQUIDATION_RANGE_CHART_ORACLE_RAIL_AXIS.max)
        ? terminalTickLabel
        : ''
    },
  },
})

// Grid index 0 always carries the real liquidation range scale; grid index 1 is the compact oracle rail.
const buildSplitGrids = (layout: SplitLayout) =>
  layout.mode === 'split-left'
    ? [
        {
          left: `${SPLIT_GRID.oracleRailWidth}%`,
          width: `${SPLIT_GRID.mainWidth}%`,
          top: CHART_LAYOUT.rangeBorderGutter,
          bottom: CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter,
        },
        {
          left: 0,
          width: `${SPLIT_GRID.oracleRailWidth}%`,
          top: CHART_LAYOUT.rangeBorderGutter,
          bottom: CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter,
        },
      ]
    : [
        {
          left: 0,
          width: `${SPLIT_GRID.mainWidth}%`,
          top: CHART_LAYOUT.rangeBorderGutter,
          bottom: CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter,
        },
        {
          left: `${SPLIT_GRID.mainWidth}%`,
          width: `${SPLIT_GRID.oracleRailWidth}%`,
          top: CHART_LAYOUT.rangeBorderGutter,
          bottom: CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter,
        },
      ]

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
              yAxis: FULL_RANGE_Y_AXIS[0],
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
            { xAxis: newRange[1], yAxis: FULL_RANGE_Y_AXIS[1] },
          ] as RangeMarkArea,
        ]
      : []),
  ]
}

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
        // Center the handoff label so the stitched scale reads like one continuous axis break.
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
              // The split marker uses a synthetic rail coordinate; the real price is shown in the label.
              markerXValue: chartLayout.oracleRail.markerPosition,
              textStyle: chartTextStyle,
              xAxisIndex: 1,
              yAxisIndex: 1,
            }),
          ]),
    ],
  }
}
