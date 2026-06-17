import type { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useMemo, type ReactNode } from 'react'
import { useTheme } from '@mui/material/styles'
import { getPaddedChartAxisBounds, type ChartAxisTickLabelOptions } from '@ui-kit/shared/ui/Chart/chart.utils'
import { useEChartsTooltip } from '@ui-kit/shared/ui/Chart/hooks/useEChartsTooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { FontSize } = SizesAndSpaces

export type EChartsBarChartTooltipContext<TData> = {
  datum: TData
}

type BarColor<TData> = string | ((datum: TData, index: number) => string)

type ChartGrid = {
  left?: number | string
  top?: number | string
  right?: number | string
  bottom?: number | string
  containLabel?: boolean
}

type CategoryAxisValue = string | number

const toCategoryAxisValue = (value: unknown): CategoryAxisValue => {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number' || typeof value === 'string') return value

  return String(value)
}

export const EChartsBarChart = <
  TData extends Record<string, unknown>,
  TXKey extends Extract<keyof TData, string>,
  TYKey extends Extract<keyof TData, string>,
>({
  data,
  height,
  xKey,
  yKey,
  barColor,
  barMaxWidth,
  grid,
  renderTooltip,
  showHorizontalGrid = true,
  showVerticalGrid = false,
  xAxisHeight,
  xAxisInterval = 'auto',
  xAxisLabelRotate = 0,
  xAxisTickLabelOptions,
  xTickFormatter,
  yValue,
  yAxisLine = false,
  yAxisPosition = 'right',
  yAxisTickLabelOptions,
  yPaddingRatio = 0.2,
  yTickFormatter,
}: {
  data: TData[]
  height?: number
  xKey: TXKey
  yKey: TYKey
  barColor: BarColor<TData>
  barMaxWidth?: number
  grid?: ChartGrid
  renderTooltip?: (context: EChartsBarChartTooltipContext<TData>) => ReactNode
  showHorizontalGrid?: boolean
  showVerticalGrid?: boolean
  xAxisHeight?: number
  xAxisInterval?: number | 'auto'
  xAxisLabelRotate?: number
  xAxisTickLabelOptions?: ChartAxisTickLabelOptions
  xTickFormatter?: (value: number | string) => string
  yValue?: (datum: TData, index: number) => number
  yAxisLine?: boolean
  yAxisPosition?: 'left' | 'right'
  yAxisTickLabelOptions?: ChartAxisTickLabelOptions
  /** Sets the padding ratio for the y-axis while preserving a zero baseline for single-sign bar data. */
  yPaddingRatio?: number
  yTickFormatter?: (value: number | string) => string
}) => {
  const theme = useTheme()
  const {
    design: { Color, Text },
  } = theme

  const gridLineColor = Color.Neutral[300]
  const gridTextColor = Text.TextColors.Tertiary
  const xAxisShowMinLabel = xAxisTickLabelOptions?.showMinLabel ?? true
  const xAxisShowMaxLabel = xAxisTickLabelOptions?.showMaxLabel ?? false
  const yAxisShowMinLabel = yAxisTickLabelOptions?.showMinLabel ?? true
  const yAxisShowMaxLabel = yAxisTickLabelOptions?.showMaxLabel ?? true

  const tooltipFormatter = useEChartsTooltip(
    data,
    theme,
    renderTooltip ? (datum: TData) => renderTooltip({ datum }) : undefined,
  )
  const xAxisData = useMemo(() => data.map(item => toCategoryAxisValue(item[xKey])), [data, xKey])
  const yAxisData = useMemo(
    () => data.map((item, index) => (yValue ? yValue(item, index) : Number(item[yKey]))),
    [data, yKey, yValue],
  )
  const { min: yMin, max: yMax } = useMemo(
    () =>
      getPaddedChartAxisBounds({
        values: yAxisData,
        includeZero: true,
        paddingRatio: yPaddingRatio,
      }),
    [yAxisData, yPaddingRatio],
  )

  const option: EChartsOption = useMemo(
    () => ({
      animation: false,
      grid: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        containLabel: true,
        ...grid,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: { show: false },
        axisTick: { show: true, lineStyle: { color: gridLineColor, width: 0.5 } },
        splitLine: {
          show: showVerticalGrid,
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
          interval: xAxisInterval,
          rotate: xAxisLabelRotate,
          showMinLabel: xAxisShowMinLabel,
          showMaxLabel: xAxisShowMaxLabel,
          align: 'left',
          ...(xAxisHeight && { height: xAxisHeight }),
          formatter: (value: string | number, index?: number) => {
            const formatterValue = index == null ? value : (xAxisData[index] ?? value)
            return xTickFormatter ? xTickFormatter(formatterValue) : String(formatterValue)
          },
        },
      },
      yAxis: {
        type: 'value',
        position: yAxisPosition,
        min: yMin,
        max: yMax,
        axisLine: { show: yAxisLine, lineStyle: { color: gridLineColor, width: 0.5 } },
        axisTick: { show: true, lineStyle: { color: gridLineColor, width: 0.5 } },
        splitLine: {
          show: showHorizontalGrid,
          lineStyle: {
            color: gridLineColor,
            width: 0.5,
            type: 'solid',
          },
        },
        axisLabel: {
          color: gridTextColor,
          fontSize: FontSize.xs.desktop,
          showMinLabel: yAxisShowMinLabel,
          showMaxLabel: yAxisShowMaxLabel,
          formatter: (value: number) => (yTickFormatter ? yTickFormatter(value) : `${value}`),
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
      series: [
        {
          type: 'bar',
          data: data.map((item, index) => ({
            value: yAxisData[index],
            itemStyle: { color: typeof barColor === 'function' ? barColor(item, index) : barColor },
          })),
          ...(barMaxWidth && { barMaxWidth }),
        },
      ],
    }),
    [
      barColor,
      barMaxWidth,
      data,
      grid,
      gridLineColor,
      gridTextColor,
      showHorizontalGrid,
      showVerticalGrid,
      tooltipFormatter,
      xAxisHeight,
      xAxisInterval,
      xAxisLabelRotate,
      xAxisShowMaxLabel,
      xAxisShowMinLabel,
      xAxisData,
      xTickFormatter,
      yAxisLine,
      yAxisPosition,
      yAxisShowMaxLabel,
      yAxisShowMinLabel,
      yAxisData,
      yMax,
      yMin,
      yTickFormatter,
    ],
  )

  return <ReactECharts option={option} notMerge autoResize style={{ width: '100%', height }} />
}
