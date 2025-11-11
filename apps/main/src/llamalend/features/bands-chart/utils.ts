import { BandsChartToken, ChartDataPoint } from './types'

export const getPriceMin = (chartData: ChartDataPoint[]) => Math.min(...chartData.map((d) => d.p_down))

export const getPriceMax = (chartData: ChartDataPoint[]) => Math.max(...chartData.map((d) => d.p_up))

export const getBandsChartToken = (address: string | undefined, symbol?: string): BandsChartToken =>
  address && symbol ? { address, symbol } : undefined
