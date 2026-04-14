import type { EChartsOption } from 'echarts-for-react'
import { sum, zip } from 'lodash'
import { useMemo } from 'react'
import { PRICE_SCALE_MARGINS } from '@ui-kit/features/candle-chart'
import { ChartDataPoint, DerivedChartData } from '../types'

type MarklinePoint = Record<string, unknown> & { coord: [number, number] }
type MarklineData = [MarklinePoint, MarklinePoint][]

type Params = {
  option: EChartsOption
  priceRange?: { min: number; max: number }
  chartData: ChartDataPoint[]
  derived: DerivedChartData
}

const CHART_PADDING_MULTIPLIER = 1.1

export const useBandsChartZoom = ({ option, priceRange, chartData, derived }: Params): EChartsOption =>
  useMemo(() => {
    if (!priceRange) return option

    // getVisibleRange() returns the content range (excl. margins). The full axis span is
    // content_span / (1 - top - bottom); each margin then adds margin * fullSpan to the axis.
    const span = priceRange.max - priceRange.min
    const fullSpan = span / (1 - PRICE_SCALE_MARGINS.top - PRICE_SCALE_MARGINS.bottom)
    const yMin = priceRange.min - PRICE_SCALE_MARGINS.bottom * fullSpan
    const yMax = priceRange.max + PRICE_SCALE_MARGINS.top * fullSpan

    const totals = zip(derived.marketData, derived.userCollateralData, derived.userBorrowedData).map(sum)
    const visibleMax = chartData.reduce(
      (max, d, i) => (d.p_up >= yMin && d.p_down <= yMax ? Math.max(max, totals[i]) : max),
      0,
    )
    const xMax = visibleMax > 0 ? visibleMax * CHART_PADDING_MULTIPLIER : undefined

    // ECharts won't render a mark line whose endpoint coord falls outside the axis domain.
    // Clamp the end coord x to xMax so lines remain visible after the axis is narrowed.
    const patchedSeries =
      xMax === undefined
        ? option.series
        : (option.series as { markLine?: { data?: MarklineData } }[]).map((series) => ({
            ...series,
            ...(series.markLine && {
              markLine: {
                ...series.markLine,
                data: series.markLine.data?.map(([start, end]) => [start, { ...end, coord: [xMax, end.coord[1]] }]),
              },
            }),
          }))

    return {
      ...option,
      series: patchedSeries,
      yAxis: {
        ...option.yAxis,
        min: yMin,
        max: yMax,
      },
      ...(xMax !== undefined && {
        xAxis: {
          ...option.xAxis,
          max: xMax,
        },
      }),
    }
  }, [option, priceRange, chartData, derived])
