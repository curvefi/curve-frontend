import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { LegendSet, type LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getHealthTrackColor } from '../../features/market-position-details/market-position-details.utils'

const { Spacing } = SizesAndSpaces

const TRACK_HEIGHT_PX = 24
const AXIS_HEIGHT_PX = 24
const TOP_PADDING_PX = 16 // reserves room for the Oracle label above the marker line
const PRICE_MARKER_TICK_HEIGHT_PX = 6
const PRICE_MARKER_TICK_WIDTH_PX = 1
const PRICE_MARKER_LABEL_GAP_PX = 6
const CHART_BODY_HEIGHT_PX = TRACK_HEIGHT_PX + AXIS_HEIGHT_PX + TOP_PADDING_PX
const AXIS_BORDER_WIDTH_PX = 1

type NumberRange = readonly [number, number]

export interface SmallLiquidationRangeChartProps {
  liquidationRanges: {
    newRange?: NumberRange
    currentRange?: NumberRange
  }
  oraclePrice: number | undefined
  health: number | null | undefined
  softLiquidation?: boolean | null
  showLegend?: boolean
}

const hasRenderableRange = ([min, max]: NumberRange) => Number.isFinite(min) && Number.isFinite(max) && max > min

const getXAxisDomain = (dataMin: number, dataMax: number, oraclePriceValue: number) => {
  const min = Math.floor(dataMin - dataMin * 0.1)

  let max
  if (dataMax > oraclePriceValue) {
    max = Math.round(dataMax + dataMax * 0.1)
  } else if (oraclePriceValue < 10) {
    max = oraclePriceValue * 1.5
  } else if (oraclePriceValue > dataMax) {
    // Keep the oracle marker visible when it sits outside the liquidation range.
    max = oraclePriceValue + oraclePriceValue * 0.1
  } else {
    max = oraclePriceValue + 200
  }

  return max <= min ? ([min, min + 1] as const) : ([min, max] as const)
}

export const SmallLiquidationRangeChart = ({
  liquidationRanges,
  oraclePrice,
  health,
  softLiquidation,
  showLegend = false,
}: SmallLiquidationRangeChartProps) => {
  const { newRange, currentRange } = liquidationRanges
  const theme = useTheme()
  const renderableNewRange = newRange && hasRenderableRange(newRange) ? newRange : undefined
  const renderableCurrentRange = currentRange && hasRenderableRange(currentRange) ? currentRange : undefined
  const renderableRange = renderableNewRange ?? renderableCurrentRange
  const haveRangeData = !!renderableRange
  const parsedOraclePrice = oraclePrice == null ? NaN : Number(oraclePrice)
  const hasOraclePrice = Number.isFinite(parsedOraclePrice)

  const {
    design: { Color, Text },
  } = theme
  const chartAxisLabelColor = Text.TextColors.Tertiary
  const chartAxisLineColor = Color.Neutral[600]
  const chartReferenceLineColor = Color.Primary[300]
  const chartRangeColor = getHealthTrackColor({ health, softLiquidation, theme })
  const chartRangeLabelColor = Color.Neutral[950]

  const dataMin = renderableRange?.[0] ?? 0
  const dataMax = renderableRange?.[1] ?? 0
  const [xMin, xMax] = getXAxisDomain(dataMin, dataMax, hasOraclePrice ? parsedOraclePrice : 0)

  const option: EChartsOption = useMemo(
    () => ({
      animation: false,
      grid: { left: 0, top: TOP_PADDING_PX, right: 0, bottom: AXIS_HEIGHT_PX },
      xAxis: {
        type: 'value',
        min: xMin,
        max: xMax,
        axisLine: {
          show: true,
          onZero: false,
          lineStyle: { color: chartAxisLineColor, width: AXIS_BORDER_WIDTH_PX },
        },
        axisTick: {
          show: true,
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
          formatter: (tick: number) => `${formatNumber(tick, { ...(tick > 10 && { decimals: 0 }) })}`,
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
            data: haveRangeData
              ? [
                  [
                    {
                      xAxis: renderableRange[0],
                      itemStyle: { color: chartRangeColor },
                      label: {
                        show: true,
                        position: 'inside',
                        formatter: 'LR',
                        color: chartRangeLabelColor,
                        fontWeight: 'bold',
                        fontSize: 12,
                      },
                    },
                    { xAxis: renderableRange[1] },
                  ],
                ]
              : [],
          },
          ...(hasOraclePrice && {
            markLine: {
              silent: true,
              symbol: ['none', 'none'],
              lineStyle: {
                color: chartReferenceLineColor,
                width: 1,
                opacity: 1,
                type: 'solid',
              },
              label: {
                show: true,
                formatter: t`Oracle`,
                position: 'end',
                color: chartReferenceLineColor,
                fontSize: 11,
                fontWeight: 'bold',
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
      chartRangeColor,
      chartRangeLabelColor,
      chartReferenceLineColor,
      hasOraclePrice,
      haveRangeData,
      parsedOraclePrice,
      renderableRange,
      xMax,
      xMin,
    ],
  )

  const legendPayload: LegendItem[] = [
    {
      label: t`Oracle Price`,
      line: { lineStroke: chartReferenceLineColor, dash: '6' },
    },
    {
      label: t`Liquidation Range`,
      box: { fill: chartRangeColor },
    },
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
        <ReactECharts
          option={option}
          notMerge
          lazyUpdate
          autoResize
          style={{ width: '100%', height: CHART_BODY_HEIGHT_PX }}
          opts={{ renderer: 'svg' }}
        />
      </Box>
      {showLegend && (
        <Stack direction="row" gap={Spacing.sm}>
          {legendPayload.map(item => (
            <LegendSet key={item.label} {...item} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
