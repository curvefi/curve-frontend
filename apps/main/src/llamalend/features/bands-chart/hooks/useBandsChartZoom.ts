import { useMemo } from 'react'
import { PRICE_SCALE_MARGINS } from '@ui-kit/features/candle-chart'
import { BANDS_CHART_SERIES_TYPE } from '../types'
import type {
  BandsChartNativeMarkLineData,
  BandsChartOption,
  BandsChartSeries,
  ChartDataPoint,
  DerivedChartData,
  HorizontalLineSeriesData,
  RangeSeriesData,
} from '../types'

type Params = {
  option: BandsChartOption
  priceRange?: { min: number; max: number }
  chartData: ChartDataPoint[]
  derived: DerivedChartData
}

const CHART_PADDING_MULTIPLIER = 1.1

// Range areas and custom range lines store their horizontal span inside series data.
// When synced candle-chart zoom narrows the x-axis, patch those spans so overlays
// still reach the chart edge. Oracle remains an ECharts markLine and is patched separately.
const patchRangeOverlayData = (data: RangeSeriesData, xMax: number): RangeSeriesData =>
  data.map(([xStart, _xEnd, lowerPrice, upperPrice]) => [xStart, xMax, lowerPrice, upperPrice])

const patchHorizontalLineData = (data: HorizontalLineSeriesData, xMax: number): HorizontalLineSeriesData =>
  data.map(([xStart, _xEnd, price]) => [xStart, xMax, price])

const patchNativeMarkLineData = (
  data: BandsChartNativeMarkLineData | undefined,
  xMax: number,
): BandsChartNativeMarkLineData | undefined =>
  data?.map(([start, end]) => [start, { ...end, coord: [xMax, end.coord[1]] }])

const patchSeries = (series: BandsChartSeries, xMax: number): BandsChartSeries => {
  switch (series.bandsChartSeriesType) {
    case BANDS_CHART_SERIES_TYPE.rangeArea:
      return { ...series, data: patchRangeOverlayData(series.data, xMax) }
    case BANDS_CHART_SERIES_TYPE.rangeLine:
      return { ...series, data: patchHorizontalLineData(series.data, xMax) }
    case BANDS_CHART_SERIES_TYPE.oracleLine:
      return {
        ...series,
        ...(series.markLine && {
          markLine: {
            ...series.markLine,
            data: patchNativeMarkLineData(series.markLine.data, xMax),
          },
        }),
      }
    case BANDS_CHART_SERIES_TYPE.band:
      return series
  }
}

export const useBandsChartZoom = ({ option, priceRange, chartData, derived }: Params): BandsChartOption =>
  useMemo(() => {
    if (!priceRange) return option

    // getVisibleRange() returns the content range (excl. margins). The full axis span is
    // content_span / (1 - top - bottom); each margin then adds margin * fullSpan to the axis.
    const span = priceRange.max - priceRange.min
    const fullSpan = span / (1 - PRICE_SCALE_MARGINS.top - PRICE_SCALE_MARGINS.bottom)
    const yMin = priceRange.min - PRICE_SCALE_MARGINS.bottom * fullSpan
    const yMax = priceRange.max + PRICE_SCALE_MARGINS.top * fullSpan

    const visibleMax = chartData.reduce(
      (max, d, i) => (d.p_up >= yMin && d.p_down <= yMax ? Math.max(max, derived.bandTotalData[i] ?? 0) : max),
      0,
    )
    const xMax = visibleMax > 0 ? visibleMax * CHART_PADDING_MULTIPLIER : undefined

    // ECharts won't render a mark line whose endpoint coord falls outside the axis domain.
    // Clamp the end coord x to xMax so lines remain visible after the axis is narrowed.
    const patchedSeries = xMax === undefined ? option.series : option.series?.map(series => patchSeries(series, xMax))

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
