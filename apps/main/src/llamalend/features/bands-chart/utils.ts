import { ChartDataPoint } from './types'

export const getPriceMin = (chartData: ChartDataPoint[], oraclePrice: string | undefined) => {
  const min = chartData.length > 0 ? Math.min(...chartData.map((d) => d.p_down)) : 0
  if (oraclePrice && Number.isFinite(Number(oraclePrice)) && Number(oraclePrice) < min && chartData.length > 0) {
    const bandDelta = chartData[0].p_up - chartData[0].p_down
    return +oraclePrice - bandDelta * 5
  }
  return min
}

export const getPriceMax = (chartData: ChartDataPoint[], oraclePrice: string | undefined) => {
  const max = chartData.length > 0 ? Math.max(...chartData.map((d) => d.p_up)) : 0
  if (oraclePrice && Number.isFinite(Number(oraclePrice)) && Number(oraclePrice) > max && chartData.length > 0) {
    const bandDelta = chartData[0].p_up - chartData[0].p_down
    return +oraclePrice + bandDelta * 5
  }
  return max
}
