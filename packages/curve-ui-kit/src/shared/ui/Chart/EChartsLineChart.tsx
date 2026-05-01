import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
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

type EChartsLineChartTooltipContext<TData, TSeriesKey extends string> = {
  datum: TData
  visibleSeries: LineSeriesConfig<TSeriesKey>[]
}

type EChartsLineMarkLine = { value: number; label?: string; color: string; dash?: string }

/** Derive y-axis bounds from all visible series so toggling legend items adjusts the range */
const getYAxisBounds = <TData extends Record<string, unknown>, TSeriesKey extends string>(
  data: TData[],
  activeSeries: LineSeriesConfig<TSeriesKey>[],
  paddingRatio: number,
): { yMin: number; yMax: number } => {
  const values = data.flatMap(item => activeSeries.map(s => Number(item[s.key])).filter(Number.isFinite))
  if (!values.length) return { yMin: 0, yMax: 0 }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = min === max ? 1 : (max - min) * paddingRatio
  return { yMin: min - padding, yMax: max + padding }
}

const parseDashType = (dash?: string): 'solid' | number[] => {
  const segments = dash
    ?.split(' ')
    .map(segment => Number(segment))
    .filter(segment => Number.isFinite(segment) && segment > 0)
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
  xAxisType,
  markLines,
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
  xAxisType?: 'time' | 'value'
  markLines?: EChartsLineMarkLine[]
  /** Sets the padding ratio for the y-axis, used to add space above and below the data points */
  yPaddingRatio?: number
}) => {
  const theme = useTheme()
  const {
    design: { Color, Text },
  } = theme

  const gridLineColor = Color.Neutral[300]
  const gridTextColor = Text.TextColors.Tertiary

  const xTickFormatterRef = useRef(xTickFormatter)
  const yTickFormatterRef = useRef(yTickFormatter)
  useEffect(() => {
    xTickFormatterRef.current = xTickFormatter
    yTickFormatterRef.current = yTickFormatter
  })

  const activeSeries = useMemo(
    () => (visibleSeries ? series.filter(item => visibleSeries.includes(item.key)) : series),
    [series, visibleSeries],
  )

  const { yMin, yMax } = useMemo(
    () => getYAxisBounds(data, activeSeries, yPaddingRatio),
    [data, activeSeries, yPaddingRatio],
  )

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
        top: 0,
        right: 0,
        bottom: markLines?.some(ml => ml.label) ? 24 : 0,
      },
      xAxis: {
        type: xAxisType ?? 'time',
        axisLine: { show: false },
        axisTick: { show: true, lineStyle: { color: gridLineColor, width: 0.5 } },
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
          hideOverlap: true,
          showMinLabel: true,
          showMaxLabel: false,
          align: 'left',
          formatter: (value: string | number) => {
            if (!xTickFormatterRef.current) return String(value)
            return xTickFormatterRef.current(value as number)
          },
        },
      },
      yAxis: {
        type: 'value',
        position: 'right',
        min: yMin,
        max: yMax,
        axisLine: { show: false },
        axisTick: { show: true, lineStyle: { color: gridLineColor, width: 0.5 } },
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
          showMaxLabel: false,
          formatter: (value: number) => (yTickFormatterRef.current ? yTickFormatterRef.current(value) : `${value}`),
        },
      },
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        axisPointer: {
          type: 'line',
          lineStyle: {
            width: 1,
            color: gridTextColor,
          },
        },
        formatter: tooltipFormatter,
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
      },
      series: activeSeries.map((line, index) => ({
        name: line.label,
        type: 'line',
        data: data.map(item => [item[xKey], Number(item[line.key])]),
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
        ...(index === 0 &&
          markLines?.length && {
            markLine: {
              silent: true,
              symbol: ['none', 'none'],
              lineStyle: {
                width: 1,
              },
              data: markLines
                .filter(markLine => Number.isFinite(markLine.value))
                .map(markLine => ({
                  xAxis: markLine.value,
                  ...(markLine.label && {
                    label: {
                      show: true,
                      formatter: markLine.label,
                      position: 'start' as const,
                      color: '#fff',
                      fontSize: FontSize.xs.desktop,
                      backgroundColor: markLine.color,
                      padding: [2, 4],
                      offset: [0, 0],
                    },
                  }),
                  ...((markLine.color || markLine.dash) && {
                    lineStyle: {
                      ...(markLine.color && { color: markLine.color }),
                      ...(markLine.dash && { type: parseDashType(markLine.dash) }),
                    },
                  }),
                })),
            },
          }),
      })),
    }),
    [activeSeries, data, gridLineColor, gridTextColor, markLines, tooltipFormatter, xAxisType, xKey, yMax, yMin],
  )

  return <ReactECharts option={option} notMerge autoResize style={{ width: '100%', height }} />
}
