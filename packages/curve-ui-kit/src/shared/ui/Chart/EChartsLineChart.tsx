import ReactECharts, { type EChartsOption } from 'echarts-for-react'
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Box } from '@mui/material'
import { ThemeProvider, useTheme } from '@mui/material/styles'
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

export type EChartsLineChartProps<
  TData extends Record<string, unknown>,
  TSeriesKey extends Extract<keyof TData, string>,
  TXKey extends Extract<keyof TData, string>,
> = {
  data: TData[]
  height?: number
  xKey: TXKey
  series: LineSeriesConfig<TSeriesKey>[]
  visibleSeries?: TSeriesKey[]
  yAxisDataKey: TSeriesKey
  xTickFormatter?: (value: TData[TXKey]) => string
  yTickFormatter?: (value: number) => string
  renderTooltip?: (context: EChartsLineChartTooltipContext<TData, TSeriesKey>) => ReactNode
}

type TooltipArrayParams = { dataIndex: number }[]
type TooltipItemParams = { dataIndex: number }

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
  height = 400,
  xKey,
  series,
  visibleSeries,
  yAxisDataKey,
  xTickFormatter,
  yTickFormatter,
  renderTooltip,
}: EChartsLineChartProps<TData, TSeriesKey, TXKey>) => {
  const theme = useTheme()
  const {
    design: { Color, Text },
  } = theme
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const tooltipRootRef = useRef<Root | null>(null)

  const gridLineColor = Color.Neutral[300]
  const gridTextColor = Text.TextColors.Tertiary
  const activeSeries = useMemo(() => {
    if (!visibleSeries) return series
    const visibleKeys = new Set<TSeriesKey>(visibleSeries)
    return series.filter((item) => visibleKeys.has(item.key))
  }, [series, visibleSeries])

  const yAxisSeriesValues = useMemo(
    () => data.map((item) => Number(item[yAxisDataKey])).filter((value) => Number.isFinite(value)),
    [data, yAxisDataKey],
  )

  const { yMin, yMax } = useMemo(() => {
    if (!yAxisSeriesValues.length) {
      return { yMin: 0, yMax: 0 }
    }

    const min = Math.min(...yAxisSeriesValues)
    const max = Math.max(...yAxisSeriesValues)

    const padding = min === max ? 1 : (max - min) * 0.1
    return { yMin: min - padding, yMax: max + padding }
  }, [yAxisSeriesValues])

  const tooltipFormatter = useCallback(
    (params: unknown) => {
      if (!renderTooltip) return ''

      if (!tooltipRef.current) {
        tooltipRef.current = document.createElement('div')
        tooltipRootRef.current = createRoot(tooltipRef.current)
      }

      let dataIndex: number | undefined
      if (Array.isArray(params)) {
        const arr = params as TooltipArrayParams
        dataIndex = arr.length > 0 ? arr[0].dataIndex : undefined
      } else if (params && typeof params === 'object' && 'dataIndex' in params) {
        dataIndex = (params as TooltipItemParams).dataIndex
      }

      const datum = dataIndex != null ? data[dataIndex] : null

      if (datum && tooltipRootRef.current) {
        tooltipRootRef.current.render(
          <ThemeProvider theme={theme}>{renderTooltip({ datum, visibleSeries: activeSeries })}</ThemeProvider>,
        )
      } else if (tooltipRootRef.current) {
        tooltipRootRef.current.render(null)
      }

      return tooltipRef.current
    },
    [activeSeries, data, renderTooltip, theme],
  )

  useEffect(
    () => () => {
      tooltipRootRef.current?.unmount()
      tooltipRootRef.current = null
      tooltipRef.current = null
    },
    [],
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
          showMaxLabel: false,
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
      <ReactECharts option={option} style={{ width: '100%', height }} opts={{ renderer: 'canvas' }} />
    </Box>
  )
}
