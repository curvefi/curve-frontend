import type { LpPriceOhlcDataFormatted } from './types'

/**
 * Calculate percentile value from sorted array
 */
function percentile(sortedArray: number[], percentile: number): number {
  if (sortedArray.length === 0) return 0

  const index = (percentile / 100) * (sortedArray.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index % 1

  if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1]

  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
}

/**
 * Extract all price values from OHLC data for statistical analysis
 */
function extractPriceValues(ohlcData: LpPriceOhlcDataFormatted[]): number[] {
  const values: number[] = []

  for (const candle of ohlcData) {
    values.push(candle.open, candle.high, candle.low, candle.close)
  }

  return values.filter((value) => typeof value === 'number' && !isNaN(value) && isFinite(value))
}

/**
 * Calculate smart visible price range that excludes extreme outliers
 * while keeping all data in the chart for manual zoom
 *
 * @param ohlcData - OHLC data array
 * @param lowerPercentile - Lower percentile bound (default 2% - very conservative)
 * @param upperPercentile - Upper percentile bound (default 98% - very conservative)
 * @param padding - Additional padding as percentage of range (default 10%)
 * @returns Object with suggested visible range bounds or null if no valid data
 */
export function calculateSmartVisibleRange(
  ohlcData: LpPriceOhlcDataFormatted[],
  lowerPercentile = 2,
  upperPercentile = 98,
  padding = 0.1,
): { from: number; to: number } | null {
  if (ohlcData.length === 0) return null

  const allPrices = extractPriceValues(ohlcData)
  if (allPrices.length === 0) return null

  const sortedPrices = [...allPrices].sort((a, b) => a - b)

  const lowerBound = percentile(sortedPrices, lowerPercentile)
  const upperBound = percentile(sortedPrices, upperPercentile)

  // Add padding to the range
  const range = upperBound - lowerBound
  const paddingAmount = range * padding

  return {
    from: Math.max(0, lowerBound - paddingAmount),
    to: upperBound + paddingAmount,
  }
}

/**
 * Check if the current visible range should be adjusted due to outliers
 *
 * @param ohlcData - OHLC data array
 * @param lowerPercentile - Lower percentile for outlier detection
 * @param upperPercentile - Upper percentile for outlier detection
 * @returns true if smart scaling should be applied
 */
export function shouldApplySmartScaling(
  ohlcData: LpPriceOhlcDataFormatted[],
  lowerPercentile = 2,
  upperPercentile = 98,
): boolean {
  if (ohlcData.length < 10) return false // Not enough data for meaningful analysis

  const allPrices = extractPriceValues(ohlcData)
  if (allPrices.length === 0) return false

  const sortedPrices = [...allPrices].sort((a, b) => a - b)

  const min = sortedPrices[0]
  const max = sortedPrices[sortedPrices.length - 1]
  const lowerBound = percentile(sortedPrices, lowerPercentile)
  const upperBound = percentile(sortedPrices, upperPercentile)

  const fullRange = max - min
  const mainRange = upperBound - lowerBound

  // Apply smart scaling if the main range is significantly smaller than the full range
  // This indicates the presence of outliers that would make the chart hard to read
  return fullRange > 0 && mainRange > 0 && fullRange / mainRange > 3
}
