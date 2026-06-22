import type { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useMemo, type ReactNode } from 'react'
import { useTheme } from '@mui/material/styles'
import { useEChartsTooltip } from '@ui-kit/shared/ui/Chart/hooks/useEChartsTooltip'

export type EChartsBarChartTooltipContext<TData> = {
  datum: TData
}

type BarColor<TData> = string | ((datum: TData, index: number) => string)

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
  renderTooltip,
  showVerticalGrid = false,
  xAxisInterval,
  xAxisLabelRotate = 0,
  xTickFormatter,
  yValue,
  yTickFormatter,
}: {
  data: TData[]
  height?: number
  xKey: TXKey
  yKey: TYKey
  barColor: BarColor<TData>
  renderTooltip?: (context: EChartsBarChartTooltipContext<TData>) => ReactNode
  showVerticalGrid?: boolean
  xAxisInterval?: number
  xAxisLabelRotate?: number
  xTickFormatter?: (value: number | string) => string
  yValue?: (datum: TData, index: number) => number
  yTickFormatter?: (value: number | string) => string
}) => {
  const theme = useTheme()
  const {
    design: { Color, Text },
    typography,
  } = theme

  const gridLineColor = Color.Neutral[300]
  const gridTextColor = Text.TextColors.Tertiary

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

  const option: EChartsOption = useMemo(
    () => ({
      animation: false,
      backgroundColor: 'transparent',
      textStyle: { fontFamily: typography.bodyMRegular.fontFamily as string, color: gridTextColor },
      grid: {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        boundaryGap: false,
        axisLine: { show: true, onZero: false, lineStyle: { color: gridLineColor } },
        axisTick: { show: true, lineStyle: { color: gridLineColor } },
        splitLine: { show: showVerticalGrid, showMaxLine: false, lineStyle: { color: gridLineColor } },
        axisLabel: {
          color: gridTextColor,
          align: 'left',
          ...(xAxisInterval != null && { interval: xAxisInterval }),
          ...(xAxisLabelRotate !== 0 && { rotate: xAxisLabelRotate }),
          formatter: (value: string | number, index?: number) => {
            const formatterValue = index == null ? value : (xAxisData[index] ?? value)
            return xTickFormatter ? xTickFormatter(formatterValue) : String(formatterValue)
          },
        },
      },
      yAxis: {
        type: 'value',
        position: 'right',
        axisLine: { show: true, lineStyle: { color: gridLineColor } },
        axisTick: { show: true, lineStyle: { color: gridLineColor } },
        splitLine: {
          lineStyle: {
            color: gridLineColor,
          },
        },
        axisLabel: {
          color: gridTextColor,
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
        },
      ],
    }),
    [
      barColor,
      data,
      gridLineColor,
      gridTextColor,
      showVerticalGrid,
      tooltipFormatter,
      typography.bodyMRegular.fontFamily,
      xAxisInterval,
      xAxisLabelRotate,
      xAxisData,
      xTickFormatter,
      yAxisData,
      yTickFormatter,
    ],
  )

  return <ReactECharts option={option} notMerge autoResize style={{ width: '100%', height }} />
}
