import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo, type ReactNode } from 'react'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEChartsReactTooltip } from '@ui-kit/shared/ui/Chart/hooks/useEChartsReactTooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { FontSize } = SizesAndSpaces

export type LineSeriesConfig<TSeriesKey extends string> = {
  key: TSeriesKey
  label: string
  color: string
  dash?: string
  strokeWidth?: number
}

export type EChartsLineChartTooltipContext<TData, TSeriesKey extends string> = {
  datum: TData
  visibleSeries: LineSeriesConfig<TSeriesKey>[]
}

const parseDashType = (dash?: string): 'solid' | number[] => {
  if (!dash || dash === 'none') return 'solid'
  const segments = dash
    .split(' ')
    .map((segment) => Number(segment))
    .filter((segment) => Number.isFinite(segment) && segment > 0)

  return segments.length > 0 ? segments : 'solid'
}

export const EChartsLineChart = <
  TData extends Record<string, unknown>,
  TSeriesKey extends Extract<keyof TData, string>,
  TXKey extends Extract<keyof TData, string>,
>({
  data,
  height,
  xKey,
  series,
  visibleSeries,
  yAxisDataKey,
  xTickFormatter,
  yTickFormatter,
  renderTooltip,
}: {
  data: TData[]
  height?: number
  xKey: TXKey
  series: LineSeriesConfig<TSeriesKey>[]
  visibleSeries?: TSeriesKey[]
  yAxisDataKey: TSeriesKey
  xTickFormatter?: (value: TData[TXKey]) => string
  yTickFormatter?: (value: number) => string
  renderTooltip?: (context: EChartsLineChartTooltipContext<TData, TSeriesKey>) => ReactNode
}) => {
  const theme = useTheme()
  const {
    design: { Color, Text },
  } = theme

  const gridLineColor = Color.Neutral[300]
  const gridTextColor = Text.TextColors.Tertiary
  const activeSeries = useMemo(
    () => (visibleSeries ? series.filter((item) => visibleSeries.includes(item.key)) : series),
    [series, visibleSeries],
  )

  const { yMin, yMax } = useMemo(() => {
    const values = data.map((item) => Number(item[yAxisDataKey])).filter(Number.isFinite)
    if (!values.length) return { yMin: 0, yMax: 0 }

    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = min === max ? 1 : (max - min) * 0.2
    return { yMin: min - padding, yMax: max + padding }
  }, [data, yAxisDataKey])

  const tooltipFormatter = useEChartsReactTooltip(
    data,
    theme,
    renderTooltip ? (datum: TData) => renderTooltip({ datum, visibleSeries: activeSeries }) : undefined,
  )

  const option: EChartsOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      animation: false,
      grid: {
        left: 16,
        top: 16,
        right: 16,
        bottom: 16,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((item) => item[xKey]),
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: gridLineColor,
            width: 0.3,
            type: 'solid',
          },
        },
        axisLabel: {
          color: gridTextColor,
          fontSize: FontSize.xs.desktop,
          hideOverlap: true,
          showMinLabel: false,
          showMaxLabel: false,
          margin: 4,
          formatter: (value: string | number) => {
            if (!xTickFormatter) return String(value)
            return xTickFormatter(value as TData[TXKey])
          },
        },
      },
      yAxis: {
        type: 'value',
        min: yMin,
        max: yMax,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: gridLineColor,
            width: 0.3,
            type: 'solid',
          },
        },
        axisLabel: {
          color: gridTextColor,
          fontSize: FontSize.xs.desktop,
          showMinLabel: false,
          showMaxLabel: true,
          formatter: (value: number) => (yTickFormatter ? yTickFormatter(value) : `${value}`),
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            width: 1,
            color: gridTextColor,
            opacity: 0.3,
          },
        },
        formatter: tooltipFormatter,
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
      },
      series: activeSeries.map((line) => ({
        name: line.label,
        type: 'line',
        data: data.map((item) => Number(item[line.key])),
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 4,
        connectNulls: false,
        itemStyle: {
          color: line.color,
          opacity: 1,
        },
        lineStyle: {
          color: line.color,
          width: line.strokeWidth ?? 2,
          type: parseDashType(line.dash),
        },
      })),
    }),
    [
      activeSeries,
      data,
      gridLineColor,
      gridTextColor,
      tooltipFormatter,
      xKey,
      xTickFormatter,
      yMax,
      yMin,
      yTickFormatter,
    ],
  )

  return (
    <Box sx={{ position: 'relative', width: '99%' }}>
      <ReactECharts option={option} notMerge style={{ width: '100%', height }} opts={{ renderer: 'canvas' }} />
    </Box>
  )
}
