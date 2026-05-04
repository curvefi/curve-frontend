import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { CHART_LINE_DASH_PATTERNS, CHART_REFERENCE_LINE_WIDTH } from '@ui-kit/shared/ui/Chart/chart.utils'
import { LegendSet, type LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { FontSize, FontWeight, Spacing } = SizesAndSpaces

const TRACK_HEIGHT_PX = 24
const AXIS_HEIGHT_PX = 24
const TOP_PADDING_PX = 16 // reserves room for the Oracle label above the marker line
const PRICE_MARKER_TICK_HEIGHT_PX = 6
const PRICE_MARKER_TICK_WIDTH_PX = 1
const PRICE_MARKER_LABEL_GAP_PX = 6
const CHART_BODY_HEIGHT_PX = TRACK_HEIGHT_PX + AXIS_HEIGHT_PX + TOP_PADDING_PX

type NumberRange = readonly [number, number]

const FULL_RANGE_Y_AXIS: NumberRange = [0, 1]
const BOTTOM_ALIGNED_INSET_RANGE_Y_AXIS: NumberRange = [0, 0.9]

type RangeMarkArea = [Record<string, unknown>, Record<string, unknown>]
type RangeMarkAreaOptions = {
  range: NumberRange
  yRange?: NumberRange
  color: string
  label: string
  labelColor: string
  showLabel: boolean
  z2: number
}

export interface SmallLiquidationRangeChartProps {
  liquidationRanges: {
    newRange?: NumberRange
    currentRange?: NumberRange
  }
  oraclePrice: number | undefined
}

const hasRenderableRange = ([min, max]: NumberRange) => Number.isFinite(min) && Number.isFinite(max) && max > min

const getRangeLabel = (formatter: string, color: string, show: boolean) => ({
  show,
  position: 'inside',
  formatter,
  color,
  fontWeight: FontWeight.Semi_Bold,
  fontSize: FontSize.xs.desktop,
})

const createRangeMarkArea = ({
  range,
  yRange = FULL_RANGE_Y_AXIS,
  color,
  label,
  labelColor,
  showLabel,
  z2,
}: RangeMarkAreaOptions): RangeMarkArea => [
  {
    xAxis: range[0],
    yAxis: yRange[0],
    z2,
    itemStyle: { color },
    label: getRangeLabel(label, labelColor, showLabel),
  },
  { xAxis: range[1], yAxis: yRange[1] },
]

const getXAxisDomain = (values: number[]) => {
  const finiteValues = values.filter(Number.isFinite)

  if (!finiteValues.length) return [0, 1] as const

  const dataMin = Math.min(...finiteValues)
  const dataMax = Math.max(...finiteValues)
  const minPadding = Math.abs(dataMin) * 0.1 || 1
  const maxPadding = Math.abs(dataMax) * 0.1 || 1
  const min = Math.floor(dataMin - minPadding)
  const max = Math.ceil(dataMax + maxPadding)

  return max <= min ? ([min, min + 1] as const) : ([min, max] as const)
}

export const SmallLiquidationRangeChart = ({ liquidationRanges, oraclePrice }: SmallLiquidationRangeChartProps) => {
  const { newRange, currentRange } = liquidationRanges
  const theme = useTheme()
  const renderableNewRange = newRange && hasRenderableRange(newRange) ? newRange : undefined
  const renderableCurrentRange = currentRange && hasRenderableRange(currentRange) ? currentRange : undefined
  const haveNewRangeData = !!renderableNewRange
  const haveCurrentRangeData = !!renderableCurrentRange
  const parsedOraclePrice = oraclePrice == null ? NaN : Number(oraclePrice)
  const hasOraclePrice = Number.isFinite(parsedOraclePrice)

  const {
    design: { Chart, Color, Text },
  } = theme
  const chartAxisLabelColor = Text.TextColors.Tertiary
  const chartAxisLineColor = Color.Neutral[600]
  const chartReferenceLineColor = Color.Primary[500]
  const chartRangeLabelColor = Text.TextColors.Primary
  const chartCurrentRangeColor = Chart.LiquidationZone.Current
  const chartNewRangeColor = Chart.LiquidationZone.Future

  const domainValues = [
    ...(renderableCurrentRange ?? []),
    ...(renderableNewRange ?? []),
    ...(hasOraclePrice ? [parsedOraclePrice] : []),
  ]
  const [xMin, xMax] = getXAxisDomain(domainValues)

  const rangeMarkAreas = useMemo(() => {
    const markAreas: RangeMarkArea[] = []
    const currentRangeLabel = 'LR'
    const newRangeLabel = haveCurrentRangeData ? 'LR (new)' : 'LR'

    if (renderableCurrentRange) {
      markAreas.push(
        createRangeMarkArea({
          range: renderableCurrentRange,
          color: chartCurrentRangeColor,
          label: currentRangeLabel,
          labelColor: chartRangeLabelColor,
          showLabel: !haveNewRangeData,
          z2: 1,
        }),
      )
    }

    if (renderableNewRange) {
      markAreas.push(
        createRangeMarkArea({
          range: renderableNewRange,
          yRange: haveCurrentRangeData ? BOTTOM_ALIGNED_INSET_RANGE_Y_AXIS : FULL_RANGE_Y_AXIS,
          color: chartNewRangeColor,
          label: newRangeLabel,
          labelColor: chartRangeLabelColor,
          showLabel: true,
          z2: 2,
        }),
      )
    }

    return markAreas
  }, [
    chartCurrentRangeColor,
    chartNewRangeColor,
    chartRangeLabelColor,
    haveCurrentRangeData,
    haveNewRangeData,
    renderableCurrentRange,
    renderableNewRange,
  ])

  const option: EChartsOption = useMemo(
    () => ({
      grid: { left: 0, top: TOP_PADDING_PX, right: 0, bottom: AXIS_HEIGHT_PX },
      xAxis: {
        type: 'value',
        min: xMin,
        max: xMax,
        axisLine: {
          onZero: false,
          lineStyle: { color: chartAxisLineColor },
        },
        axisTick: {
          length: PRICE_MARKER_TICK_HEIGHT_PX,
          lineStyle: { color: chartAxisLineColor, width: PRICE_MARKER_TICK_WIDTH_PX },
        },
        splitLine: { show: false },
        axisLabel: {
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
          data: [[xMin, 0]],
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
                type: CHART_LINE_DASH_PATTERNS.reference,
              },
              label: {
                formatter: t`Oracle`,
                color: chartReferenceLineColor,
                fontSize: FontSize.xs.desktop,
                fontWeight: FontWeight.Bold,
                distance: 2,
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
      hasOraclePrice,
      parsedOraclePrice,
      rangeMarkAreas,
      xMax,
      xMin,
    ],
  )

  const legendPayload: LegendItem[] = [
    ...(hasOraclePrice
      ? [
          {
            label: t`Oracle Price`,
            line: { lineStroke: chartReferenceLineColor, dash: CHART_LINE_DASH_PATTERNS.reference },
          },
        ]
      : []),
    ...(haveCurrentRangeData
      ? [
          {
            label: t`Current Liquidation Range`,
            box: { fill: chartCurrentRangeColor },
          },
        ]
      : []),
    ...(haveNewRangeData
      ? [
          {
            label: haveCurrentRangeData ? t`New Liquidation Range` : t`Liquidation Range`,
            box: { fill: chartNewRangeColor },
          },
        ]
      : []),
  ]

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
