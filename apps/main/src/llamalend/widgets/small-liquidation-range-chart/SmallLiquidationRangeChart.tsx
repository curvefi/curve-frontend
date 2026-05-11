import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme, type Theme } from '@mui/material/styles'
import type { Amount } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { CHART_LINE_DASH_PATTERNS, CHART_LINE_WIDTHS } from '@ui-kit/shared/ui/Chart/chart.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { getSmallLiquidationRangeChartDomain } from './small-liquidation-range-chart.utils'

const { FontSize, FontWeight, LineHeight, Spacing } = SizesAndSpaces

const CHART_LAYOUT = {
  trackHeight: 24,
  axisHeight: 24,
  rangeBorderGutter: CHART_LINE_WIDTHS.referenceLine,
  priceMarker: {
    tickHeight: 6,
    labelGap: 6,
  },
} as const

const ORACLE_MARKER_ARROW = {
  width: 11,
  height: 9,
  pathData: 'M5.19641 9L0.000234437 -0.0000342871L10.3926 -0.0000333786L5.19641 9Z',
} as const

const ORACLE_MARKER_LAYOUT = {
  arrow: ORACLE_MARKER_ARROW,
  label: {
    height: CHART_LAYOUT.trackHeight - ORACLE_MARKER_ARROW.height,
    horizontalPadding: Spacing.xs.desktop,
    estimatedCharacterWidthRatio: 0.58,
  },
} as const

const CHART_BODY_HEIGHT_PX = CHART_LAYOUT.trackHeight + CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter * 2

const FULL_RANGE_Y_AXIS = [0, 1] as const
const NEW_RANGE_BORDER_DASH = CHART_LINE_DASH_PATTERNS.regular

type RangeMarkArea = [Record<string, unknown>, Record<string, unknown>]
type LiquidationRange = readonly [Amount, Amount]
type RenderableLiquidationRange = readonly [number, number]
type ChartTextStyle = {
  fontFamily: string
  fontSize: number
  fontWeight: string | number
  lineHeight: number
}
type ChartColors = {
  axisLabel: string
  axisLine: string
  referenceLine: string
  oracleMarkerLabel: string
  oracleMarkerLabelBackground: string
  rangeLabel: string
  currentRange: string
  newRangeLine: string
}
type OracleMarkerRenderParams = { coordSys?: { width?: number; x?: number } }
type OracleMarkerRenderApi = {
  value: (index: number) => number
  coord: (point: number[]) => number[]
}

export interface SmallLiquidationRangeChartProps {
  liquidationRanges: {
    newRange?: LiquidationRange
    currentRange?: LiquidationRange
  }
  oraclePrice: Amount | undefined
}

const RANGE_LABEL = t`LR`

// ECharts value axes behave most predictably when every coordinate uses the same numeric representation.
const toRenderableRange = (range: LiquidationRange | undefined): RenderableLiquidationRange | undefined =>
  range && [Number(range[0]), Number(range[1])]

const toEChartsPixelValue = (value: number | string, htmlFontSize: number) => {
  if (typeof value === 'number') return value

  const numericValue = Number.parseFloat(value)
  return value.endsWith('rem') ? numericValue * htmlFontSize : numericValue
}

const getBodyXsRegularChartTextStyle = (theme: Theme): ChartTextStyle => ({
  fontFamily: theme.typography.bodyXsRegular.fontFamily as string,
  fontSize: toEChartsPixelValue(FontSize.xs.desktop, theme.typography.htmlFontSize),
  fontWeight: (theme.typography.bodyXsRegular.fontWeight as string | number | undefined) ?? FontWeight.Medium,
  lineHeight: toEChartsPixelValue(LineHeight.xs.desktop, theme.typography.htmlFontSize),
})

const getChartColors = (theme: Theme): ChartColors => {
  const {
    design: { Chart, Color, Text },
  } = theme

  return {
    axisLabel: Text.TextColors.Tertiary,
    axisLine: Color.Neutral[600],
    referenceLine: Color.Primary[500],
    oracleMarkerLabel: Text.TextColors.Highlight,
    oracleMarkerLabelBackground: Color.Neutral[50],
    rangeLabel: Text.TextColors.Primary,
    currentRange: Chart.LiquidationZone.Current,
    newRangeLine: Chart.LiquidationZone.FutureLine,
  }
}

const getRenderableRanges = ({ currentRange, newRange }: SmallLiquidationRangeChartProps['liquidationRanges']) => ({
  currentRange: toRenderableRange(currentRange),
  newRange: toRenderableRange(newRange),
})

const getSeriesData = ({
  currentRange,
  newRange,
  oraclePrice,
}: {
  currentRange?: RenderableLiquidationRange
  newRange?: RenderableLiquidationRange
  oraclePrice?: number
}) =>
  [...(currentRange ?? []), ...(newRange ?? []), ...(oraclePrice === undefined ? [] : [oraclePrice])].map(value => [
    value,
    0,
  ])

const buildRangeMarkAreas = ({
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
  const markAreas: RangeMarkArea[] = []
  const rangeLabelStyle = {
    fontFamily: textStyle.fontFamily,
    fontSize: textStyle.fontSize,
    fontWeight: FontWeight.Semi_Bold,
    lineHeight: textStyle.lineHeight,
  }

  if (currentRange) {
    const [currentRangeMin, currentRangeMax] = currentRange

    markAreas.push([
      {
        xAxis: currentRangeMin,
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
      { xAxis: currentRangeMax, yAxis: FULL_RANGE_Y_AXIS[1] },
    ])
  }

  if (newRange) {
    const [newRangeMin, newRangeMax] = newRange

    markAreas.push([
      {
        xAxis: newRangeMin,
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
      { xAxis: newRangeMax, yAxis: FULL_RANGE_Y_AXIS[1] },
    ])
  }

  return markAreas
}

const getOracleMarkerLabelWidth = ({
  htmlFontSize,
  text,
  textStyle,
}: {
  htmlFontSize: number
  text: string
  textStyle: ChartTextStyle
}) => {
  // Canvas text measurement is unavailable in ECharts renderItem, so use the common average glyph width estimate.
  const estimatedTextWidth = text.length * textStyle.fontSize * ORACLE_MARKER_LAYOUT.label.estimatedCharacterWidthRatio
  const horizontalPadding = toEChartsPixelValue(ORACLE_MARKER_LAYOUT.label.horizontalPadding, htmlFontSize)

  return estimatedTextWidth + horizontalPadding * 2
}

const getOracleMarkerGeometry = ({
  chartLeft,
  chartWidth,
  htmlFontSize,
  markerX,
  text,
  textStyle,
  trackTopY,
}: {
  chartLeft: number
  chartWidth: number
  htmlFontSize: number
  markerX: number
  text: string
  textStyle: ChartTextStyle
  trackTopY: number
}) => {
  const labelWidth = getOracleMarkerLabelWidth({ htmlFontSize, text, textStyle })
  const labelLeft = Math.min(Math.max(markerX - labelWidth / 2, chartLeft), chartLeft + chartWidth - labelWidth)
  const labelTop = trackTopY

  return {
    labelLeft,
    labelTop,
    labelWidth,
    labelCenterX: labelLeft + labelWidth / 2,
    labelCenterY: labelTop + ORACLE_MARKER_LAYOUT.label.height / 2,
    arrowLeft: markerX - ORACLE_MARKER_LAYOUT.arrow.width / 2,
    arrowTop: labelTop + ORACLE_MARKER_LAYOUT.label.height,
  }
}

const buildOracleMarkerSeries = ({
  colors,
  formattedOraclePrice,
  htmlFontSize,
  oraclePrice,
  textStyle,
}: {
  colors: ChartColors
  formattedOraclePrice: string
  htmlFontSize: number
  oraclePrice: number
  textStyle: ChartTextStyle
}) => ({
  type: 'custom' as const,
  data: [[oraclePrice, FULL_RANGE_Y_AXIS[1]]],
  silent: true,
  z: 5,
  encode: { x: 0, y: 1 },
  renderItem: (params: OracleMarkerRenderParams, api: OracleMarkerRenderApi) => {
    const [markerX, trackTopY] = api.coord([api.value(0), api.value(1)])
    const geometry = getOracleMarkerGeometry({
      chartLeft: params.coordSys?.x ?? 0,
      chartWidth: params.coordSys?.width ?? 0,
      htmlFontSize,
      markerX,
      text: formattedOraclePrice,
      textStyle,
      trackTopY,
    })

    return {
      type: 'group',
      children: [
        {
          type: 'rect',
          shape: {
            x: geometry.labelLeft,
            y: geometry.labelTop,
            width: geometry.labelWidth,
            height: ORACLE_MARKER_LAYOUT.label.height,
          },
          style: {
            fill: colors.oracleMarkerLabelBackground,
          },
        },
        {
          type: 'text',
          style: {
            x: geometry.labelCenterX,
            y: geometry.labelCenterY,
            text: formattedOraclePrice,
            fill: colors.oracleMarkerLabel,
            fontSize: textStyle.fontSize,
            fontWeight: textStyle.fontWeight,
            lineHeight: textStyle.lineHeight,
            fontFamily: textStyle.fontFamily,
            align: 'center',
            verticalAlign: 'middle',
          },
        },
        {
          type: 'path',
          x: geometry.arrowLeft,
          y: geometry.arrowTop,
          shape: {
            pathData: ORACLE_MARKER_LAYOUT.arrow.pathData,
          },
          style: {
            fill: colors.referenceLine,
          },
        },
      ],
    }
  },
})

export const SmallLiquidationRangeChart = ({ liquidationRanges, oraclePrice }: SmallLiquidationRangeChartProps) => {
  const { newRange, currentRange } = liquidationRanges
  const theme = useTheme()
  const colors = useMemo(() => getChartColors(theme), [theme])
  const chartTextStyle = useMemo(() => getBodyXsRegularChartTextStyle(theme), [theme])
  const { currentRange: renderableCurrentRange, newRange: renderableNewRange } = useMemo(
    () => getRenderableRanges({ currentRange, newRange }),
    [currentRange, newRange],
  )
  const parsedOraclePrice = Number(oraclePrice)
  const hasNewRange = !!renderableNewRange
  const hasCurrentRange = !!renderableCurrentRange
  const hasOraclePrice = oraclePrice !== undefined
  const hasChartData = hasCurrentRange || hasNewRange || hasOraclePrice
  const formattedOraclePrice = hasOraclePrice ? formatNumber(parsedOraclePrice, { abbreviate: false }) : ''
  const xAxisDomain = useMemo(
    () =>
      getSmallLiquidationRangeChartDomain({
        currentRange: renderableCurrentRange,
        newRange: renderableNewRange,
        oraclePrice: hasOraclePrice ? parsedOraclePrice : undefined,
      }),
    [hasOraclePrice, parsedOraclePrice, renderableCurrentRange, renderableNewRange],
  )

  const seriesData = useMemo(
    () =>
      getSeriesData({
        currentRange: renderableCurrentRange,
        newRange: renderableNewRange,
        oraclePrice: hasOraclePrice ? parsedOraclePrice : undefined,
      }),
    [hasOraclePrice, parsedOraclePrice, renderableCurrentRange, renderableNewRange],
  )

  const rangeMarkAreas = useMemo(
    () =>
      buildRangeMarkAreas({
        colors,
        currentRange: renderableCurrentRange,
        hasNewRange,
        newRange: renderableNewRange,
        textStyle: chartTextStyle,
      }),
    [chartTextStyle, colors, hasNewRange, renderableCurrentRange, renderableNewRange],
  )

  const option: EChartsOption = useMemo(
    () => ({
      animation: false,
      textStyle: {
        fontFamily: chartTextStyle.fontFamily,
      },
      grid: {
        left: 0,
        top: CHART_LAYOUT.rangeBorderGutter,
        right: 0,
        bottom: CHART_LAYOUT.axisHeight + CHART_LAYOUT.rangeBorderGutter,
      },
      xAxis: {
        type: 'value',
        min: xAxisDomain?.[0],
        max: xAxisDomain?.[1],
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
          fontFamily: chartTextStyle.fontFamily,
          fontSize: chartTextStyle.fontSize,
          fontWeight: chartTextStyle.fontWeight,
          lineHeight: chartTextStyle.lineHeight,
          show: hasChartData,
          showMinLabel: true,
          showMaxLabel: true,
          alignMinLabel: 'left',
          alignMaxLabel: 'right',
          color: colors.axisLabel,
          hideOverlap: true,
          margin: CHART_LAYOUT.priceMarker.labelGap,
          formatter: (tick: number) => `${formatNumber(tick, { abbreviate: true })}`,
        },
      },
      yAxis: { type: 'value', min: 0, max: 1, show: false },
      series: [
        {
          type: 'line',
          data: seriesData,
          showSymbol: false,
          silent: true,
          lineStyle: { opacity: 0 },
          markArea: {
            silent: true,
            data: rangeMarkAreas,
          },
        },
        ...(hasOraclePrice
          ? [
              buildOracleMarkerSeries({
                colors,
                formattedOraclePrice,
                htmlFontSize: theme.typography.htmlFontSize,
                oraclePrice: parsedOraclePrice,
                textStyle: chartTextStyle,
              }),
            ]
          : []),
      ],
    }),
    [
      chartTextStyle,
      colors,
      hasChartData,
      hasOraclePrice,
      formattedOraclePrice,
      parsedOraclePrice,
      rangeMarkAreas,
      seriesData,
      theme.typography.htmlFontSize,
      xAxisDomain,
    ],
  )

  return (
    <Stack sx={{ width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          height: `${CHART_BODY_HEIGHT_PX}px`,
          minHeight: `${CHART_BODY_HEIGHT_PX}px`,
        }}
      >
        <ReactECharts option={option} notMerge style={{ width: '100%', height: CHART_BODY_HEIGHT_PX }} />
      </Box>
    </Stack>
  )
}
