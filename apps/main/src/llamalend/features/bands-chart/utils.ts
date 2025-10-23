import { ChartDataPoint } from './types'

/**
 * Finds the index of a band that contains the given price within its range
 *
 * @param chartData - Array of chart data points with price bands
 * @param price - Price to search for
 * @returns Index of the band containing the price, or -1 if not found
 */
export const findBandIndexByPrice = (chartData: ChartDataPoint[], price: number): number =>
  chartData.findIndex((d) => price >= d.p_down && price <= d.p_up)

/**
 * Finds the index of the band closest to the given price
 * Uses the median price of each band for comparison
 *
 * @param chartData - Array of chart data points with price bands
 * @param price - Target price
 * @returns Index of the closest band, or -1 if chartData is empty
 */
export const findClosestBandIndex = (chartData: ChartDataPoint[], price: number): number => {
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
