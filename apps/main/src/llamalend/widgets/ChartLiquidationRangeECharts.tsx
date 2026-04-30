import type { CustomSeriesRenderItem, CustomSeriesRenderItemReturn } from 'echarts'
import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { LegendSet, type LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getHealthTrackColor } from '../features/market-position-details/market-position-details.utils'
import type { LiquidationRangeData } from './ChartLiquidationRange'

const { Spacing } = SizesAndSpaces

const TRACK_HEIGHT_PX = 32 // 2rem
const AXIS_HEIGHT_PX = 24 // 1.5rem
const TOP_PADDING_PX = 8 // 0.5rem
const PRICE_MARKER_TICK_HEIGHT_PX = 4 // 0.25rem
const PRICE_MARKER_TICK_WIDTH_PX = 2 // 0.125rem
const PRICE_MARKER_LABEL_GAP_PX = 4 // 0.25rem
const CHART_BODY_HEIGHT_PX = TRACK_HEIGHT_PX + AXIS_HEIGHT_PX + TOP_PADDING_PX
const AXIS_BORDER_WIDTH_PX = 1
const THUMB_LABEL_FONT_SIZE_PX = 12
const CATEGORY_INDEX = 0

type NumberRange = readonly [number, number]
type CustomGroupChildren = Extract<NonNullable<CustomSeriesRenderItemReturn>, { type: 'group' }>['children']
type RectStyle = { fill: string; stroke?: string; lineWidth?: number; opacity?: number }

export interface ChartLiquidationRangeProps {
  data: LiquidationRangeData[]
  health: number | null | undefined
  softLiquidation?: boolean | null
  height?: number
  isManage?: boolean
  showLegend?: boolean
}

const getRange = (values: number[] = [0, 0]): NumberRange => {
  const [valueA = 0, valueB = 0] = values
  return [Math.min(valueA, valueB), Math.max(valueA, valueB)]
}

const hasRenderableRange = ([min, max]: NumberRange) => Number.isFinite(min) && Number.isFinite(max) && max > min

const isValueInRange = (value: number, range: NumberRange) =>
  Number.isFinite(value) && hasRenderableRange(range) && value >= range[0] && value < range[1]

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

export const ChartLiquidationRange = ({
  data,
  health,
  softLiquidation,
  height = 85,
  isManage = false,
  showLegend = false,
}: ChartLiquidationRangeProps) => {
  const chartData = data[0]
  const oraclePrice = chartData?.oraclePrice ?? ''
  const theme = useTheme()
  const newRange = useMemo(() => getRange(chartData?.new), [chartData?.new])
  const currRange = useMemo(() => getRange(chartData?.curr), [chartData?.curr])
  const haveNewData = hasRenderableRange(newRange)
  const haveCurrData = isManage && hasRenderableRange(currRange)
  const parsedOraclePrice = oraclePrice ? Number(oraclePrice) : NaN
  const hasOraclePrice = Number.isFinite(parsedOraclePrice)
  const isInLiquidationRange = hasOraclePrice && isValueInRange(parsedOraclePrice, haveCurrData ? currRange : newRange)
  const showFireStyle = isInLiquidationRange && theme.key === 'chad'
  const chartBodyHeight = showLegend ? CHART_BODY_HEIGHT_PX : height

  const {
    design: { Color, Text },
  } = theme
  const chartAxisColor = Text.TextColors.Secondary
  const chartReferenceLineColor = Color.Primary[300]
  const chartRangeColor = getHealthTrackColor({ health, softLiquidation, theme })
  const chartLabelColor = Text.TextColors.Secondary
  const thumbFontFamily = String(theme.typography.bodyXsBold.fontFamily ?? '')
  const thumbFontWeight = Number(theme.typography.bodyXsBold.fontWeight) || 700

  const dataValues = [...(haveNewData ? newRange : []), ...(haveCurrData ? currRange : [])]
  const dataMin = dataValues.length ? Math.min(...dataValues) : 0
  const dataMax = dataValues.length ? Math.max(...dataValues) : 0
  const [xMin, xMax] = getXAxisDomain(dataMin, dataMax, hasOraclePrice ? parsedOraclePrice : 0)

  const option: EChartsOption = useMemo(() => {
    const [newMin, newMax] = newRange
    const [currMin, currMax] = currRange

    const renderItem: CustomSeriesRenderItem = (_params, api) => {
      const children: CustomGroupChildren = []
      const categoryValue = Number(api.value(4))
      const [, centerY] = api.coord([newMin, categoryValue])

      const pushRangeRect = (range: NumberRange, style: RectStyle) => {
        if (!hasRenderableRange(range)) return null

        const [startX] = api.coord([range[0], categoryValue])
        const [endX] = api.coord([range[1], categoryValue])

        children.push({
          type: 'rect',
          silent: true,
          shape: {
            x: Math.min(startX, endX),
            y: centerY - TRACK_HEIGHT_PX / 2,
            width: Math.abs(endX - startX),
            height: TRACK_HEIGHT_PX,
          },
          style,
        })

        return { startX, endX }
      }

      if (haveCurrData) {
        pushRangeRect(currRange, {
          fill: chartAxisColor,
          opacity: 0.16,
          stroke: chartAxisColor,
          lineWidth: 2,
        })
      }

      const newCoords = haveNewData ? pushRangeRect(newRange, { fill: chartRangeColor }) : null

      if (newCoords) {
        children.push({
          type: 'text',
          silent: true,
          style: {
            text: chartData?.newLabel ?? 'LR',
            x: (newCoords.startX + newCoords.endX) / 2,
            y: centerY,
            fill: chartLabelColor,
            align: 'center',
            verticalAlign: 'middle',
            fontSize: THUMB_LABEL_FONT_SIZE_PX,
            fontFamily: thumbFontFamily,
            fontWeight: thumbFontWeight,
          },
        })
      }

      return {
        type: 'group',
        emphasisDisabled: true,
        children,
      }
    }

    return {
      animation: false,
      grid: {
        left: 0,
        top: TOP_PADDING_PX,
        right: 0,
        bottom: AXIS_HEIGHT_PX,
      },
      xAxis: {
        type: 'value',
        min: xMin,
        max: xMax,
        axisLine: {
          show: true,
          onZero: false,
          lineStyle: {
            color: chartLabelColor,
            width: AXIS_BORDER_WIDTH_PX,
          },
        },
        axisTick: {
          show: true,
          length: PRICE_MARKER_TICK_HEIGHT_PX,
          lineStyle: {
            color: chartLabelColor,
            width: PRICE_MARKER_TICK_WIDTH_PX,
          },
        },
        splitLine: { show: false },
        axisLabel: {
          showMinLabel: true,
          showMaxLabel: true,
          alignMinLabel: 'left',
          alignMaxLabel: 'right',
          color: chartAxisColor,
          hideOverlap: true,
          margin: PRICE_MARKER_LABEL_GAP_PX,
          formatter: (tick: number) => `${formatNumber(tick, { ...(tick > 10 && { decimals: 0 }) })}`,
        },
      },
      yAxis: {
        type: 'category',
        data: [chartData?.name ?? ''],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
      series: [
        {
          name: 'range',
          type: 'custom',
          coordinateSystem: 'cartesian2d',
          data: [[newMin, newMax, currMin, currMax, CATEGORY_INDEX]],
          encode: { x: [0, 1, 2, 3], y: 4 },
          clip: false,
          renderItem,
        },
        ...(hasOraclePrice
          ? [
              {
                name: 'oracle-marker',
                type: 'line',
                data: [[parsedOraclePrice, CATEGORY_INDEX]],
                showSymbol: false,
                silent: true,
                lineStyle: {
                  opacity: 0,
                },
                tooltip: {
                  show: false,
                },
                emphasis: {
                  disabled: true,
                },
                markLine: {
                  silent: true,
                  symbol: ['none', 'none'],
                  lineStyle: {
                    color: chartReferenceLineColor,
                    width: 1,
                    opacity: showFireStyle ? 0.2 : 1,
                    type: 'solid',
                  },
                  label: {
                    show: true,
                    formatter: t`Oracle`,
                    position: 'start',
                    color: chartReferenceLineColor,
                    fontSize: 11,
                    fontWeight: 'bold',
                    distance: 2,
                  },
                  data: [{ xAxis: parsedOraclePrice }],
                },
              },
            ]
          : []),
      ],
    }
  }, [
    chartAxisColor,
    chartData?.name,
    chartData?.newLabel,
    chartLabelColor,
    chartRangeColor,
    chartReferenceLineColor,
    currRange,
    hasOraclePrice,
    haveCurrData,
    haveNewData,
    newRange,
    parsedOraclePrice,
    showFireStyle,
    thumbFontFamily,
    thumbFontWeight,
    xMax,
    xMin,
  ])

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
    <Stack
      sx={{
        width: '100%',
        height: `${height}px`,
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: `${chartBodyHeight}px`,
          minHeight: `${chartBodyHeight}px`,
        }}
      >
        <ReactECharts
          option={option}
          notMerge
          lazyUpdate
          autoResize
          style={{ width: '100%', height: chartBodyHeight }}
          opts={{ renderer: 'svg' }}
        />
      </Box>
      {showLegend && (
        <Stack direction="row" gap={Spacing.sm}>
          {legendPayload.map((item) => (
            <LegendSet key={item.label} {...item} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
