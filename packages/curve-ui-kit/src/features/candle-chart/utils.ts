import { formatNumber } from '@ui-kit/utils'
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

const FORMATTER_DECIMALS_ABOVE_ONE = 2

/**
 * Formats a price value for display on the chart's price axis with adaptive decimal precision.
 *
 * The function dynamically calculates the number of decimal places to show based on the
 * visible price range (delta between max and min). This ensures that price labels remain
 * meaningful and readable regardless of whether:
 * - Viewing a stablecoin hovering around $1.00 (needs many decimals)
 * - Viewing a token worth fractions of a cent (needs many decimals)
 * - Viewing a high-value asset like BTC (needs fewer decimals)
 *
 * @param x - The price value to format
 * @param min - The minimum price in the visible range (lowest candle low)
 * @param max - The maximum price in the visible range (highest candle high)
 * @returns A formatted string representation of the price
 *
 * @example
 * // Large price range (e.g., $1000 to $2000)
 * priceFormatter(1500.123456, 1000, 2000) // Returns "1500.12" (2 decimals)
 *
 * @example
 * // Small price range (e.g., $0.0001 to $0.0002)
 * priceFormatter(0.00015, 0.0001, 0.0002) // Returns "0.00015" (5 decimals)
 *
 * @example
 * // Stablecoin range (e.g., $0.987 to $1.000)
 * priceFormatter(0.999, 0.987, 1.000) // Returns "0.9990" (4 decimals)
 *
 * @example
 * // Large value with abbreviation (value > 10,000)
 * priceFormatter(15000.5, 14000, 16000) // Returns "15K" (abbreviated)
 */
export function priceFormatter(x: number, min: number, max: number) {
  const delta = max - min

  /*
   * Calculate the number of decimal places needed.
   *
   * If delta >= 1, the price range is large enough that 2 decimal places suffices.
   *
   * If delta < 1, we use logarithm base 10 to determine precision.
   * The formula: decimals = -Math.floor(Math.log10(delta)) + 2
   *
   * The "+2" ensures we have enough precision to distinguish between tick marks.
   * Charts typically divide the visible range into ~5 tick marks, so tick spacing
   * is roughly delta/5. We need enough decimals to show differences at that scale.
   *
   * For example, with delta = 0.013 (range from 0.987 to 1.000):
   * - Ticks might be: 0.987, 0.990, 0.993, 0.996, 0.999
   * - Tick spacing is ~0.003, requiring 4 decimals to display correctly
   * - Formula: -floor(log10(0.013)) + 2 = -floor(-1.89) + 2 = 2 + 2 = 4 ✓
   *
   * Without "+2", we'd get 2 decimals, showing: 0.99, 0.99, 0.99, 1.00, 1.00
   * making adjacent ticks appear identical.
   *
   * Examples:
   * - delta = 0.5   → decimals = -floor(-0.301) + 2 = 1 + 2 = 3
   * - delta = 0.1   → decimals = -floor(-1) + 2 = 1 + 2 = 3
   * - delta = 0.05  → decimals = -floor(-1.301) + 2 = 2 + 2 = 4
   * - delta = 0.013 → decimals = -floor(-1.89) + 2 = 2 + 2 = 4
   * - delta = 0.01  → decimals = -floor(-2) + 2 = 2 + 2 = 4
   * - delta = 0.005 → decimals = -floor(-2.301) + 2 = 3 + 2 = 5
   * - delta = 0.001 → decimals = -floor(-3) + 2 = 3 + 2 = 5
   */
  const calculatedDecimals = -Math.floor(Math.log10(delta)) + 2
  const decimals =
    delta >= 1 ? FORMATTER_DECIMALS_ABOVE_ONE : Math.max(calculatedDecimals, FORMATTER_DECIMALS_ABOVE_ONE)

  /*
   * Format the number using the calculated decimal precision.
   * For large numbers (>10,000), use abbreviations like "K", "M"
   * to keep labels compact (e.g., 15000 → "15K")
   */
  return formatNumber(x, {
    decimals,
    abbreviate: x > 10000,
  })
}
