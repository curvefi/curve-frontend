import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import type { Amount } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { CHART_REFERENCE_LINE_WIDTH } from '@ui-kit/shared/ui/Chart/chart.utils'
import { LegendSet, type LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { FontSize, FontWeight, Spacing } = SizesAndSpaces

const TRACK_HEIGHT_PX = 24
const AXIS_HEIGHT_PX = 24
const TOP_PADDING_PX = 16 // reserves room for the Oracle label above the marker line
const PRICE_MARKER_TICK_HEIGHT_PX = 6
const PRICE_MARKER_LABEL_GAP_PX = 6
const CHART_BODY_HEIGHT_PX = TRACK_HEIGHT_PX + AXIS_HEIGHT_PX + TOP_PADDING_PX

type LiquidationRange = readonly [Amount, Amount]

const FULL_RANGE_Y_AXIS = [0, 1] as const
/** When both new and current ranges are present, new range is shortened by 10% to allow some visibility of the current range */
const BOTTOM_ALIGNED_INSET_RANGE_Y_AXIS = [0, 0.9] as const

type RangeMarkArea = [Record<string, unknown>, Record<string, unknown>]

export interface SmallLiquidationRangeChartProps {
  liquidationRanges: {
    newRange?: LiquidationRange
    currentRange?: LiquidationRange
  }
  oraclePrice: Amount | undefined
}

const toRenderableRange = (range: LiquidationRange | undefined): readonly [number, number] | undefined =>
  range && [Number(range[0]), Number(range[1])]

const getNewRangeLegendLabel = (hasCurrentRange: boolean) => {
  if (hasCurrentRange) return t`New Liquidation Range`
  return t`Liquidation Range`
}

const getRangeLabel = ({ isCurrentRange, hasOtherRange }: { isCurrentRange: boolean; hasOtherRange: boolean }) => {
  if (!hasOtherRange) return t`LR`
  return isCurrentRange ? '' : t`LR (new)`
}

export const SmallLiquidationRangeChart = ({ liquidationRanges, oraclePrice }: SmallLiquidationRangeChartProps) => {
  const { newRange, currentRange } = liquidationRanges
  const theme = useTheme()
  const renderableNewRange = toRenderableRange(newRange)
  const renderableCurrentRange = toRenderableRange(currentRange)
  const [currentRangeMin, currentRangeMax] = renderableCurrentRange ?? []
  const [newRangeMin, newRangeMax] = renderableNewRange ?? []
  const hasNewRange = !!newRange
  const hasCurrentRange = !!currentRange
  const hasOraclePrice = oraclePrice !== undefined
  const parsedOraclePrice = Number(oraclePrice)
  const hasChartData = hasCurrentRange || hasNewRange || hasOraclePrice

  const {
    design: { Chart, Color, Text },
  } = theme
  const chartAxisLabelColor = Text.TextColors.Tertiary
  const chartAxisLineColor = Color.Neutral[600]
  const chartReferenceLineColor = Color.Primary[500]
  const chartRangeLabelColor = Text.TextColors.Primary
  const chartCurrentRangeColor = Chart.LiquidationZone.Current
  const chartNewRangeColor = Chart.LiquidationZone.Future

  const seriesData = useMemo(() => {
    const domainValues: number[] = []

    if (hasCurrentRange) domainValues.push(currentRangeMin!, currentRangeMax!)
    if (hasNewRange) domainValues.push(newRangeMin!, newRangeMax!)
    if (hasOraclePrice) domainValues.push(Number(oraclePrice))

    return domainValues.map(value => [value, 0])
  }, [
    currentRangeMax,
    currentRangeMin,
    hasCurrentRange,
    hasNewRange,
    hasOraclePrice,
    newRangeMax,
    newRangeMin,
    oraclePrice,
  ])

  const rangeMarkAreas = useMemo(() => {
    const markAreas: RangeMarkArea[] = []
    const currentRangeLabel = getRangeLabel({ isCurrentRange: true, hasOtherRange: hasNewRange })
    const newRangeLabel = getRangeLabel({ isCurrentRange: false, hasOtherRange: hasCurrentRange })

    if (hasCurrentRange) {
      markAreas.push([
        {
          xAxis: currentRangeMin,
          yAxis: FULL_RANGE_Y_AXIS[0],
          z2: 1,
          itemStyle: { color: chartCurrentRangeColor },
          label: {
            show: !hasNewRange,
            position: 'inside',
            formatter: currentRangeLabel,
            color: chartRangeLabelColor,
            fontWeight: FontWeight.Semi_Bold,
            fontSize: FontSize.xs.desktop,
          },
        },
        { xAxis: currentRangeMax, yAxis: FULL_RANGE_Y_AXIS[1] },
      ])
    }

    if (hasNewRange) {
      const yRange = hasCurrentRange ? BOTTOM_ALIGNED_INSET_RANGE_Y_AXIS : FULL_RANGE_Y_AXIS

      markAreas.push([
        {
          xAxis: newRangeMin,
          yAxis: yRange[0],
          z2: 2,
          itemStyle: { color: chartNewRangeColor },
          label: {
            show: true,
            position: 'inside',
            formatter: newRangeLabel,
            color: chartRangeLabelColor,
            fontWeight: FontWeight.Semi_Bold,
            fontSize: FontSize.xs.desktop,
          },
        },
        { xAxis: newRangeMax, yAxis: yRange[1] },
      ])
    }

    return markAreas
  }, [
    chartCurrentRangeColor,
    chartNewRangeColor,
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
      grid: { left: 0, top: TOP_PADDING_PX, right: 0, bottom: AXIS_HEIGHT_PX },
      xAxis: {
        type: 'value',
        boundaryGap: ['10%', '10%'],
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
      hasChartData,
      hasOraclePrice,
      parsedOraclePrice,
      rangeMarkAreas,
      seriesData,
    ],
  )

  const legendPayload = (
    [
      hasOraclePrice && {
        label: t`Oracle Price`,
        line: { lineStroke: chartReferenceLineColor },
      },
      hasCurrentRange && {
        label: t`Current Liquidation Range`,
        box: { fill: chartCurrentRangeColor },
      },
      hasNewRange && {
        label: getNewRangeLegendLabel(hasCurrentRange),
        box: { fill: chartNewRangeColor },
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
