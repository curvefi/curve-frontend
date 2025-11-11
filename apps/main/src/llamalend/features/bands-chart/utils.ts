import { ChartDataPoint } from './types'

export const getPriceMin = (chartData: ChartDataPoint[]) =>
  chartData.length > 0 ? Math.min(...chartData.map((d) => d.p_down)) : 0

export const getPriceMax = (chartData: ChartDataPoint[]) =>
  chartData.length > 0 ? Math.max(...chartData.map((d) => d.p_up)) : 0
