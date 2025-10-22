import { ChartDataPoint } from './types'

export const findBandIndexByPrice = (chartData: ChartDataPoint[], price: number) =>
  chartData.findIndex((d) => price >= d.p_down && price <= d.p_up)

export const findClosestBandIndex = (chartData: ChartDataPoint[], price: number) => {
  if (chartData.length === 0) return -1
  let closestIdx = 0
  let minDiff = Math.abs(chartData[0].pUpDownMedian - price)
  for (let i = 1; i < chartData.length; i++) {
    const diff = Math.abs(chartData[i].pUpDownMedian - price)
    if (diff < minDiff) {
      minDiff = diff
      closestIdx = i
    }
  }
  return closestIdx
}
