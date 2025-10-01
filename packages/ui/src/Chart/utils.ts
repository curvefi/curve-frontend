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
 * Converts an HSLA color string to RGB format
 * Lightweight Cahrts v5 adds support for HSLA, but until then we need to convert to RGB
 * @param hsla - HSLA color string (e.g. "hsla(230, 60%, 29%, 1)")
 * @returns RGB color string (e.g. "rgb(44, 57, 118)")
 * @example
 * hslaToRgb("hsla(230, 60%, 29%, 1)") // returns "rgb(44, 57, 118)"
 * hslaToRgb("hsl(230, 60%, 29%)") // returns "rgb(44, 57, 118)"
 */
export function hslaToRgb(hsla: string) {
  return hsla.replace(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/, (_, h, s, l) => {
    const a = s / 100
    const b = l / 100
    const k = (n: number) => (n + h / 30) % 12
    const f = (n: number) => b - a * Math.min(b, 1 - b) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
    return `rgb(${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))})`
  })
}

/**
 * Calculates robust price range for chart auto-scaling by filtering outliers
 * Uses percentile-based approach to exclude anomalous candles that would flatten the chart
 * @param prices - Array of all price values (highs and lows) from visible candles
 * @param lowerPercentile - Lower percentile threshold (0-1), default 0.02 (2nd percentile)
 * @param upperPercentile - Upper percentile threshold (0-1), default 0.98 (98th percentile)
 * @param padding - Padding factor to add visual comfort, default 0.05 (5%)
 * @returns Object with minValue and maxValue, or null if insufficient data
 * @example
 * const prices = [100, 101, 102, 1000, 103] // 1000 is an outlier
 * const range = calculateRobustPriceRange(prices) // excludes 1000
 */
export function calculateRobustPriceRange(
  prices: number[],
  lowerPercentile = 0.02,
  upperPercentile = 0.98,
  padding = 0.05,
): { minValue: number; maxValue: number } | null {
  if (!prices || prices.length === 0) {
    return null
  }

  // Sort prices in ascending order
  const sortedPrices = [...prices].sort((a, b) => a - b)

  // Calculate percentile indices
  const lowerIndex = Math.max(0, Math.floor(sortedPrices.length * lowerPercentile))
  const upperIndex = Math.min(sortedPrices.length - 1, Math.floor(sortedPrices.length * upperPercentile))

  const minValue = sortedPrices[lowerIndex]
  const maxValue = sortedPrices[upperIndex]

  // Add padding for visual comfort
  const range = maxValue - minValue
  const paddingAmount = range * padding

  return {
    minValue: minValue - paddingAmount,
    maxValue: maxValue + paddingAmount,
  }
}
