import { formatNumber } from '@ui-kit/utils'
import type { TimeOption } from './types'

const seconds: Record<TimeOption, number> = {
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

export const subtractTimeUnit = (timeOption: TimeOption, timestamp: number) => timestamp - seconds[timeOption]

export const getThreeHundredResultsAgo = (timeOption: TimeOption, timestamp: number) =>
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

const ABBREVIATION_CUTOFF = 10000 // Values above this are abbreviated (e.g., 15K)
const ABBREVIATION_DECIMALS = 2 // Decimals to show when abbreviating (e.g., 15.23K)

/**
 * Formats a price value for the chart's price axis with adaptive decimal precision
 * based on the visible price range. Ensures labels are meaningful whether viewing
 * stablecoins (~$1.00), micro-cap tokens (fractions of a cent), or high-value assets.
 *
 * @param x - The price value to format
 * @param delta - The difference in price between minimum and maximum price in the visible range
 * @returns Formatted price string
 *
 * @example
 * priceFormatter(1500.123, 1000, 2000)    // "1500" (delta >= 1 but 1500 < ABBREVIATION_CUTOFF → 0 decimals)
 * priceFormatter(0.999, 0.987, 1.000)     // "0.9990"  (delta = 0.013 → 4 decimals)
 * priceFormatter(0.00015, 0.0001, 0.0002) // "0.000150" (delta = 0.0001 → 6 decimals)
 * priceFormatter(15000.5, 14000, 16000)   // "15K"     (abbreviated when > 10,000)
 */
export const priceFormatter = (x: number, delta: number) =>
  formatNumber(x, {
    /*
     * For delta < 1 we're basically looking at the order of magnitude of the delta
     * to determine how many decimals are needed to show meaningful differences.
     *
     * The "+2" accounts for tick spacing (~delta/5), ensuring adjacent ticks
     * display distinct values. Without it, ticks like 0.987, 0.990, 0.993
     * would all show as "0.99".
     *
     * Examples:
     * - delta = 0     → 2 - floor(0)     = 3 decimals
     * - delta = 0.1   → 2 - floor(-1)    = 3 decimals
     * - delta = 0.013 → 2 - floor(-1.89) = 4 decimals
     * - delta = 0.001 → 2 - floor(-3)    = 5 decimals
     */
    decimals:
      delta >= 1
        ? x > ABBREVIATION_CUTOFF
          ? ABBREVIATION_DECIMALS
          : 0
        : 2 - Math.floor(Math.max(0, Math.log10(delta))),
    abbreviate: x > ABBREVIATION_CUTOFF,
    useGrouping: false,
  })
