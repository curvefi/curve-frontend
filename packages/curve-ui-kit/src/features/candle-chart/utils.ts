import type { TimeOptions } from './types'

const seconds = {
  '5m': 5 * 60,
  '15m': 15 * 60,
  '30m': 30 * 60,
  '1h': 60 * 60,
  '4h': 4 * 60 * 60,
  '6h': 6 * 60 * 60,
  '12h': 12 * 60 * 60,
  '1d': 24 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
  '14d': 14 * 24 * 60 * 60,
} as const

export const subtractTimeUnit = (timeOption: TimeOptions, timestamp: number) => timestamp - seconds[timeOption]

export const getThreeHundredResultsAgo = (timeOption: TimeOptions, timestamp: number) =>
  Math.floor(timestamp - 299 * seconds[timeOption])

export const convertToLocaleTimestamp = (unixTimestamp: number) => {
  const offsetInSeconds = new Date().getTimezoneOffset() * 60
  return unixTimestamp - offsetInSeconds
}

/**
 * Calculates robust price range for chart auto-scaling by filtering outliers
 * Uses percentile-based approach to exclude anomalous candles that would flatten the chart
 * Always includes recent candles to ensure current price action is visible
 * @param prices - Array of all price values (highs and lows) from visible candles
 * @param recentPrices - Array of recent price values that should always be included (e.g., latest candle)
 * @param lowerPercentile - Lower percentile threshold (0-1), default 0.02 (2nd percentile)
 * @param upperPercentile - Upper percentile threshold (0-1), default 0.98 (98th percentile)
 * @param padding - Padding factor to add visual comfort, default 0.05 (5%)
 * @returns Object with minValue and maxValue, or null if no data available
 * @example
 * const prices = [100, 101, 102, 1000, 103] // 1000 is an outlier
 * const recentPrices = [103] // latest price should always be visible
 * const range = calculateRobustPriceRange(prices, recentPrices) // excludes 1000 but includes 103
 */
export function calculateRobustPriceRange(
  prices: number[],
  recentPrices: number[] = [],
  lowerPercentile = 0.02,
  upperPercentile = 0.98,
  padding = 0.05,
): { minValue: number; maxValue: number } | null {
  // Return null if no data - caller should use original range
  // We can't assume a default value (like 1.0) works for all trading pairs
  if (!prices || prices.length === 0) {
    return null
  }

  // Sort prices in ascending order
  const sortedPrices = [...prices].sort((a, b) => a - b)

  // Calculate percentile indices
  const lowerIndex = Math.max(0, Math.floor(sortedPrices.length * lowerPercentile))
  const upperIndex = Math.min(sortedPrices.length - 1, Math.floor(sortedPrices.length * upperPercentile))

  let minValue = sortedPrices[lowerIndex]
  let maxValue = sortedPrices[upperIndex]

  // Ensure recent prices are always included in the range
  if (recentPrices.length > 0) {
    const recentMin = Math.min(...recentPrices)
    const recentMax = Math.max(...recentPrices)
    minValue = Math.min(minValue, recentMin)
    maxValue = Math.max(maxValue, recentMax)
  }

  // Add padding for visual comfort
  const range = maxValue - minValue
  const paddingAmount = range * padding

  return {
    minValue: minValue - paddingAmount,
    maxValue: maxValue + paddingAmount,
  }
}
