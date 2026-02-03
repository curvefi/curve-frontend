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
 * Formats a price value for the chart's price axis with ~4 significant digits.
 * Precision is determined by the smaller of the value's magnitude or the delta (price range),
 * ensuring meaningful precision for both large price swings and tight ranges (e.g., stablecoin pegs).
 *
 * @param x - The price value to format
 * @param delta - The price range (max - min) visible on the chart, used to determine precision
 * @returns Formatted price string
 *
 * @example
 * // Based on value magnitude (when delta is large):
 * priceFormatter(1234.5, 1000)    // "1235"    (1000+ → 0 decimals)
 * priceFormatter(123.456, 100)    // "123.5"   (100-999 → 1 decimal)
 * priceFormatter(1.23456, 1)      // "1.235"   (1-9 → 3 decimals)
 *
 * // Based on delta (when delta is small relative to value):
 * priceFormatter(1.000234, 0.001) // "1.0002"  (delta determines precision)
 * priceFormatter(15000.5, 10000)  // "15K"     (abbreviated when > 10,000)
 */
export const priceFormatter = (x: number, delta: number) => {
  // Handle zero or invalid values
  if (!Number.isFinite(x) || x === 0) {
    return '0'
  }

  if (x > ABBREVIATION_CUTOFF) {
    return formatNumber(x, {
      decimals: ABBREVIATION_DECIMALS,
      abbreviate: true,
      useGrouping: false,
    })
  }

  /*
   * Determine decimal precision to show ~4 significant digits.
   * Use delta magnitude when the price range is very tight relative to the value
   * (important for stablecoin pegs where values ~1.0 but variation is tiny).
   * Cap at 4 decimals to avoid overly precise displays.
   */
  const valueMagnitude = Math.floor(Math.log10(Math.abs(x)))
  const deltaMagnitude = delta > 0 ? Math.floor(Math.log10(delta)) : valueMagnitude
  // Only use delta-based precision when range is tight (delta < 1% of value's order of magnitude)
  const magnitude = deltaMagnitude < valueMagnitude - 1 ? deltaMagnitude : valueMagnitude
  const decimals = Math.min(4, Math.max(0, 3 - magnitude))

  const formatted = formatNumber(x, {
    decimals,
    abbreviate: false,
    useGrouping: false,
  })

  // Remove trailing zeros after decimal point (e.g., "1.200" → "1.2")
  return String(parseFloat(formatted))
}
