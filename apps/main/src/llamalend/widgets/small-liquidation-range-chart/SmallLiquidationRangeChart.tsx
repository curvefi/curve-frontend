import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import type { Amount } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { CHART_LINE_DASH_PATTERNS, CHART_REFERENCE_LINE_WIDTH } from '@ui-kit/shared/ui/Chart/chart.utils'
import { LegendSet, type LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { getSmallLiquidationRangeChartDomain } from './small-liquidation-range-chart.utils'

const { FontSize, FontWeight, Spacing } = SizesAndSpaces

const TRACK_HEIGHT_PX = 24
const AXIS_HEIGHT_PX = 24
const PRICE_MARKER_TICK_HEIGHT_PX = 6
const PRICE_MARKER_LABEL_GAP_PX = 6
const RANGE_BORDER_GUTTER_PX = CHART_REFERENCE_LINE_WIDTH
const CHART_BODY_HEIGHT_PX = TRACK_HEIGHT_PX + AXIS_HEIGHT_PX + RANGE_BORDER_GUTTER_PX * 2

const FULL_RANGE_Y_AXIS = [0, 1] as const
const NEW_RANGE_BORDER_DASH = CHART_LINE_DASH_PATTERNS.average

type RangeMarkArea = [Record<string, unknown>, Record<string, unknown>]
type LiquidationRange = readonly [Amount, Amount]
type RenderableLiquidationRange = readonly [number, number]

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

export const SmallLiquidationRangeChart = ({ liquidationRanges, oraclePrice }: SmallLiquidationRangeChartProps) => {
  const { newRange, currentRange } = liquidationRanges
  const theme = useTheme()
  const renderableCurrentRange = useMemo(() => toRenderableRange(currentRange), [currentRange])
  const renderableNewRange = useMemo(() => toRenderableRange(newRange), [newRange])
  const [currentRangeMin, currentRangeMax] = renderableCurrentRange ?? []
  const [newRangeMin, newRangeMax] = renderableNewRange ?? []
  const parsedOraclePrice = Number(oraclePrice)
  const hasNewRange = !!renderableNewRange
  const hasCurrentRange = !!renderableCurrentRange
  const hasOraclePrice = oraclePrice !== undefined
  const hasChartData = hasCurrentRange || hasNewRange || hasOraclePrice
  const xAxisDomain = useMemo(
    () =>
      getSmallLiquidationRangeChartDomain({
        currentRange: renderableCurrentRange,
        newRange: renderableNewRange,
        oraclePrice: hasOraclePrice ? parsedOraclePrice : undefined,
      }),
    [hasOraclePrice, parsedOraclePrice, renderableCurrentRange, renderableNewRange],
  )

  const {
    design: { Chart, Color, Text },
  } = theme
  const chartAxisLabelColor = Text.TextColors.Tertiary
  const chartAxisLineColor = Color.Neutral[600]
  const chartReferenceLineColor = Color.Primary[500]
  const chartRangeLabelColor = Text.TextColors.Primary
  const chartCurrentRangeColor = Chart.LiquidationZone.Current
  const chartNewRangeLineColor = Chart.LiquidationZone.FutureLine

  const seriesData = useMemo(() => {
    const domainValues = [
      ...(renderableCurrentRange ?? []),
      ...(renderableNewRange ?? []),
      ...(hasOraclePrice ? [parsedOraclePrice] : []),
    ]

    return domainValues.map(value => [value, 0])
  }, [hasOraclePrice, parsedOraclePrice, renderableCurrentRange, renderableNewRange])

  const rangeMarkAreas = useMemo(() => {
    const markAreas: RangeMarkArea[] = []

    if (hasCurrentRange) {
      markAreas.push([
        {
          xAxis: currentRangeMin,
          yAxis: FULL_RANGE_Y_AXIS[0],
          z2: 1,
          itemStyle: { color: chartCurrentRangeColor },
          label: {
            show: true,
            position: 'inside',
            formatter: RANGE_LABEL,
            color: chartRangeLabelColor,
            fontWeight: FontWeight.Semi_Bold,
            fontSize: FontSize.xs.desktop,
          },
        },
        { xAxis: currentRangeMax, yAxis: FULL_RANGE_Y_AXIS[1] },
      ])
    }

    if (hasNewRange) {
      markAreas.push([
        {
          xAxis: newRangeMin,
          yAxis: FULL_RANGE_Y_AXIS[0],
          z2: 2,
          itemStyle: {
            color: 'transparent',
            borderColor: chartNewRangeLineColor,
            borderType: NEW_RANGE_BORDER_DASH,
            borderWidth: CHART_REFERENCE_LINE_WIDTH,
          },
          label: {
            show: true,
            position: 'inside',
            formatter: RANGE_LABEL,
            color: chartNewRangeLineColor,
            fontWeight: FontWeight.Semi_Bold,
            fontSize: FontSize.xs.desktop,
          },
        },
        { xAxis: newRangeMax, yAxis: FULL_RANGE_Y_AXIS[1] },
      ])
    }

    return markAreas
  }, [
    chartCurrentRangeColor,
    chartNewRangeLineColor,
    chartRangeLabelColor,
    currentRangeMax,
    currentRangeMin,
    hasCurrentRange,
    hasNewRange,
    newRangeMax,
    newRangeMin,
  ])

  const option: EChartsOption = useMemo(
    () => ({
      animation: false,
      grid: { left: 0, top: RANGE_BORDER_GUTTER_PX, right: 0, bottom: AXIS_HEIGHT_PX + RANGE_BORDER_GUTTER_PX },
      xAxis: {
        type: 'value',
        min: xAxisDomain?.[0],
        max: xAxisDomain?.[1],
        axisLine: {
          onZero: false,
          lineStyle: { color: chartAxisLineColor },
        },
        axisTick: {
          length: PRICE_MARKER_TICK_HEIGHT_PX,
          lineStyle: { color: chartAxisLineColor },
        },
        splitLine: { show: false },
        axisLabel: {
          show: hasChartData,
          showMinLabel: true,
          showMaxLabel: true,
          alignMinLabel: 'left',
          alignMaxLabel: 'right',
          color: chartAxisLabelColor,
          hideOverlap: true,
          margin: PRICE_MARKER_LABEL_GAP_PX,
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
          ...(hasOraclePrice && {
            markLine: {
              silent: true,
              symbol: ['none', 'none'],
              lineStyle: {
                color: chartReferenceLineColor,
                width: CHART_REFERENCE_LINE_WIDTH,
                type: 'solid',
              },
              label: {
                show: false,
              },
              data: [{ xAxis: parsedOraclePrice }],
            },
          }),
        },
      ],
    }),
    [
      chartAxisLabelColor,
      chartAxisLineColor,
      chartReferenceLineColor,
      hasChartData,
      hasOraclePrice,
      parsedOraclePrice,
      rangeMarkAreas,
      seriesData,
      xAxisDomain,
    ],
  )

  const legendPayload = (
    [
      hasOraclePrice && {
        label: t`Oracle Price`,
        line: { lineStroke: chartReferenceLineColor },
      },
      hasCurrentRange && {
        label: t`Current`,
        box: { fill: chartCurrentRangeColor },
      },
      hasNewRange && {
        label: t`Future`,
        box: {
          outlineStroke: chartNewRangeLineColor,
          shape: 'corners',
          fill: 'transparent',
        },
      },
    ] as (LegendItem | false)[]
  ).filter((item): item is LegendItem => Boolean(item))

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
      {legendPayload.length > 0 && (
        <Stack direction="row" gap={Spacing.sm} flexWrap="wrap">
          {legendPayload.map(item => (
            <LegendSet key={item.label} {...item} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
