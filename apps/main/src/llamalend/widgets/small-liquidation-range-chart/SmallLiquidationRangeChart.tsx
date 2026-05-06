import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
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
const PRICE_MARKER_TICK_WIDTH_PX = 1
const PRICE_MARKER_LABEL_GAP_PX = 6
const CHART_BODY_HEIGHT_PX = TRACK_HEIGHT_PX + AXIS_HEIGHT_PX + TOP_PADDING_PX

type NumberRange = readonly [number, number]

const FULL_RANGE_Y_AXIS: NumberRange = [0, 1]
/** When both new and current ranges are present, new range is shortened by 10% to allow some visibility of the current range */
const BOTTOM_ALIGNED_INSET_RANGE_Y_AXIS: NumberRange = [0, 0.9]

type RangeMarkArea = [Record<string, unknown>, Record<string, unknown>]

export interface SmallLiquidationRangeChartProps {
  liquidationRanges: {
    newRange?: NumberRange
    currentRange?: NumberRange
  }
  oraclePrice: number | undefined
}

const hasRenderableRange = ([min, max]: NumberRange) => Number.isFinite(min) && Number.isFinite(max) && max > min

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
  const renderableNewRange = newRange && hasRenderableRange(newRange) ? newRange : undefined
  const renderableCurrentRange = currentRange && hasRenderableRange(currentRange) ? currentRange : undefined
  const haveNewRangeData = !!renderableNewRange
  const haveCurrentRangeData = !!renderableCurrentRange
  const parsedOraclePrice = oraclePrice == null ? NaN : Number(oraclePrice)
  const hasOraclePrice = Number.isFinite(parsedOraclePrice)
  const hasChartData = haveCurrentRangeData || haveNewRangeData || hasOraclePrice

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
    const domainValues = [
      ...(renderableCurrentRange ?? []),
      ...(renderableNewRange ?? []),
      ...(hasOraclePrice ? [parsedOraclePrice] : []),
    ].filter(Number.isFinite)

    return domainValues.map(value => [value, 0])
  }, [hasOraclePrice, parsedOraclePrice, renderableCurrentRange, renderableNewRange])

  const rangeMarkAreas = useMemo(() => {
    const markAreas: RangeMarkArea[] = []
    const currentRangeLabel = getRangeLabel({ isCurrentRange: true, hasOtherRange: haveNewRangeData })
    const newRangeLabel = getRangeLabel({ isCurrentRange: false, hasOtherRange: haveCurrentRangeData })

    if (renderableCurrentRange) {
      markAreas.push([
        {
          xAxis: renderableCurrentRange[0],
          yAxis: FULL_RANGE_Y_AXIS[0],
          z2: 1,
          itemStyle: { color: chartCurrentRangeColor },
          label: {
            show: !haveNewRangeData,
            position: 'inside',
            formatter: currentRangeLabel,
            color: chartRangeLabelColor,
            fontWeight: FontWeight.Semi_Bold,
            fontSize: FontSize.xs.desktop,
          },
        },
        { xAxis: renderableCurrentRange[1], yAxis: FULL_RANGE_Y_AXIS[1] },
      ])
    }

    if (renderableNewRange) {
      const yRange = haveCurrentRangeData ? BOTTOM_ALIGNED_INSET_RANGE_Y_AXIS : FULL_RANGE_Y_AXIS

      markAreas.push([
        {
          xAxis: renderableNewRange[0],
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
        { xAxis: renderableNewRange[1], yAxis: yRange[1] },
      ])
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
        boundaryGap: ['10%', '10%'],
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
      haveCurrentRangeData && {
        label: t`Current Liquidation Range`,
        box: { fill: chartCurrentRangeColor },
      },
      haveNewRangeData && {
        label: getNewRangeLegendLabel(haveCurrentRangeData),
        box: { fill: chartNewRangeColor },
      },
    ] as Array<LegendItem | false>
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
