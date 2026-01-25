import { formatNumber } from '@ui-kit/utils'
import { BandsChartToken, ChartDataPoint } from './types'

export const getPriceMin = (chartData: ChartDataPoint[], oraclePrice: string | undefined) => {
  const min = Math.min(...chartData.map((d) => d.p_down))
  // bandDelta ensures padding to prevent label clipping if a label is too close to the edge
  const bandDelta = chartData[0].p_down - chartData[0].p_up
  // if oraclePrice is outside of range of bands, set min to oraclePrice - bandDelta to make sure it's visible
  if (min > Number(oraclePrice)) {
    return Number(oraclePrice) - bandDelta * 2
  }
  return min - bandDelta * 2
}

export const getPriceMax = (chartData: ChartDataPoint[], oraclePrice: string | undefined) => {
  const max = Math.max(...chartData.map((d) => d.p_up))
  // bandDelta ensures padding to prevent label clipping if a label is too close to the edge
  const bandDelta = chartData[0].p_down - chartData[0].p_up
  // if oraclePrice is outside of range of bands, set max to oraclePrice + bandDelta to make sure it's visible
  if (max < Number(oraclePrice)) {
    return Number(oraclePrice) + bandDelta * 2
  }
  return max + bandDelta * 2
}

export const getBandsChartToken = (address: string | undefined, symbol?: string): BandsChartToken =>
  address && symbol ? { address, symbol } : undefined

export const formatNumberWithOptions = (value: number) =>
  formatNumber(value, {
    abbreviate: value >= 10000,
    maximumSignificantDigits: 4,
    useGrouping: false,
  })
