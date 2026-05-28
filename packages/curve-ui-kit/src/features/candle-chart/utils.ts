import { sortBy } from 'lodash'
import { TIME_OPTION_MS } from '../../lib/model/time'
import { formatNumber } from '../../utils/number'
import type { TimeOption } from './types'

const toSeconds = (timeOption: TimeOption) => TIME_OPTION_MS[timeOption] / 1000
const clampPercentile = (value: number, fallback: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback
const getPercentileIndex = (length: number, percentile: number) =>
  Math.max(0, Math.min(length - 1, Math.floor(length * percentile)))

export const subtractTimeUnit = (timeOption: TimeOption, timestamp: number) => timestamp - toSeconds(timeOption)

export const getThreeHundredResultsAgo = (timeOption: TimeOption, timestamp: number) =>
  Math.floor(timestamp - 299 * toSeconds(timeOption))

export const convertToLocaleTimestamp = (unixTimestamp: number) => {
  const offsetInSeconds = new Date().getTimezoneOffset() * 60
  return unixTimestamp - offsetInSeconds
}

/**
 * Calculates a robust non-negative price range for chart auto-scaling.
 *
 * Percentile clipping keeps old anomalous candles from flattening the chart.
 * Recent prices bypass the percentile window so current price action remains visible.
 *
 * @returns Object with minValue and maxValue, or null if no price data is available.
 * @example
 * const prices = [100, 101, 102, 1000, 103]
 * const recentPrices = [103]
 * const range = calculateRobustPriceRange(prices, recentPrices) // clips the 1000 outlier
 */
export function calculateRobustPriceRange(
  prices: number[],
  recentPrices: number[] = [],
  lowerPercentile = 0.02,
  upperPercentile = 0.98,
  padding = 0.05,
): { minValue: number; maxValue: number } | null {
  const sortedPrices = sortBy(prices, price => price)

  if (sortedPrices.length === 0) {
    // Let the chart fall back to its native autoscale rather than guessing a default price.
    return null
  }

  const lowerBound = clampPercentile(lowerPercentile, 0)
  const upperBound = clampPercentile(upperPercentile, 1)
  const lowerIndex = getPercentileIndex(sortedPrices.length, Math.min(lowerBound, upperBound))
  const upperIndex = getPercentileIndex(sortedPrices.length, Math.max(lowerBound, upperBound))

  let minValue = sortedPrices[lowerIndex]
  let maxValue = sortedPrices[upperIndex]

  if (recentPrices.length > 0) {
    const recentMin = Math.min(...recentPrices)
    const recentMax = Math.max(...recentPrices)
    minValue = Math.min(minValue, recentMin)
    maxValue = Math.max(maxValue, recentMax)
  }

  const range = maxValue - minValue
  const paddingAmount = range * (Number.isFinite(padding) && padding > 0 ? padding : 0)

  return {
    // Price charts should not show negative space introduced only by padding.
    minValue: Math.max(0, minValue - paddingAmount),
    maxValue: maxValue + paddingAmount,
  }
}

const ABBREVIATION_CUTOFF = 10000 // Values above this are abbreviated (e.g., 15k)
const ABBREVIATION_DECIMALS = 2 // Decimals to show when abbreviating (e.g., 15.23k)
const MAX_PRICE_DECIMALS = 4
const MAX_SUB_UNIT_PRICE_DECIMALS = 8

/**
 * Formats a non-negative price value for the chart's price axis with ~4 significant digits.
 *
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
 * priceFormatter(15000.5, 10000)  // "15k"     (abbreviated when > 10,000)
 */
export const priceFormatter = (x: number, delta: number) => {
  if (!Number.isFinite(x) || x < 0) {
    return ''
  }

  if (x > ABBREVIATION_CUTOFF) {
    return formatNumber(x, {
      decimals: ABBREVIATION_DECIMALS,
      abbreviate: true,
      useGrouping: false,
    })
  }

  const valueMagnitude = Math.floor(Math.log10(Math.abs(x)))
  const deltaMagnitude = delta > 0 ? Math.floor(Math.log10(delta)) : valueMagnitude
  // Let a tight visible range drive precision, while allowing extra decimals for sub-unit assets.
  const magnitude = deltaMagnitude < valueMagnitude - 1 ? deltaMagnitude : valueMagnitude
  const maxDecimals = x < 1 ? MAX_SUB_UNIT_PRICE_DECIMALS : MAX_PRICE_DECIMALS
  const decimals = Math.min(maxDecimals, Math.max(0, 3 - magnitude))

  return x.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    useGrouping: false,
  })
}
