import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useMemo, type ReactNode } from 'react'
import { useTheme } from '@mui/material/styles'
import { useEChartsTooltip } from '@ui-kit/shared/ui/Chart/hooks/useEChartsTooltip'
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
  const segments = dash
    ?.split(' ')
    .map((segment) => Number(segment))
    .filter((segment) => Number.isFinite(segment) && segment > 0)
  return segments?.length ? segments : 'solid'
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
  xTickFormatter,
  yTickFormatter,
  renderTooltip,
  yPaddingRatio = 0.2,
}: {
  data: TData[]
  height?: number
  xKey: TXKey
  series: LineSeriesConfig<TSeriesKey>[]
  visibleSeries?: TSeriesKey[]
  xTickFormatter?: (value: number | string) => string
  yTickFormatter?: (value: number | string) => string
  renderTooltip?: (context: EChartsLineChartTooltipContext<TData, TSeriesKey>) => ReactNode
  /** Sets the padding ratio for the y-axis, used to add space above and below the data points */
  yPaddingRatio?: number
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

  // Derive y-axis bounds from all visible series so toggling legend items adjusts the range
  const { yMin, yMax } = useMemo(() => {
    const values = data.flatMap((item) => activeSeries.map((s) => Number(item[s.key])).filter(Number.isFinite))
    if (!values.length) return { yMin: 0, yMax: 0 }

    let min = Infinity
    let max = -Infinity
    for (const v of values) {
      if (v < min) min = v
      if (v > max) max = v
    }
    const padding = min === max ? 1 : (max - min) * yPaddingRatio
    return { yMin: min - padding, yMax: max + padding }
  }, [data, activeSeries, yPaddingRatio])

  const tooltipFormatter = useEChartsTooltip(
    data,
    theme,
    renderTooltip ? (datum: TData) => renderTooltip({ datum, visibleSeries: activeSeries }) : undefined,
  )

  const option: EChartsOption = useMemo(
    () => ({
      animation: false,
      grid: {
        left: 0,
        top: Math.ceil((parseFloat(FontSize.xs.desktop) * 16) / 2), // prevent max label clipping
        right: 0,
        bottom: 0,
        containLabel: true,
      },
      xAxis: {
        type: 'time',
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
          showMinLabel: true,
          showMaxLabel: false,
          align: 'left',
          margin: 4,
          formatter: (value: string | number) => {
            if (!xTickFormatter) return String(value)
            return xTickFormatter(value as number)
          },
        },
      },
      yAxis: {
        type: 'value',
        position: 'right',
        min: yMin,
        max: yMax,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: gridLineColor,
            width: 0.5,
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
            width: 0.5,
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
        data: data.map((item) => [item[xKey], Number(item[line.key])]),
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: {
          color: line.color,
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

  return <ReactECharts option={option} notMerge autoResize style={{ width: '100%', height }} />
}
