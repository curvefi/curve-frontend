import type { Amount } from '@primitives/decimal.utils'
import { AVERAGE_CATEGORIES } from './average-categories'
import { formatNumber } from './number'

const DAYS_PER_YEAR = 365
export const MAX_DISPLAY_RATE_PERCENT = 5000

/**
 * Formats a percentage rate without its unit. This is useful for components that render the percentage symbol
 * separately through their number-formatting options.
 */
export const formatCappedRateValue = (value: Amount) => {
  const numericValue = Number(value)
  if (numericValue >= MAX_DISPLAY_RATE_PERCENT) {
    const cappedValue = formatNumber(MAX_DISPLAY_RATE_PERCENT, { abbreviate: false })
    return `${cappedValue}${numericValue > MAX_DISPLAY_RATE_PERCENT ? '+' : ''}`
  }

  return formatNumber(value, { abbreviate: true })
}

export const formatCappedRatePercent = (value: Amount | null | undefined) =>
  value != null && Number(value) >= MAX_DISPLAY_RATE_PERCENT
    ? `${formatCappedRateValue(value)}%`
    : formatNumber(value, 'percent.rate')

/**
 * Converts an APR into APY using periodic compounding based on a given number of days per compounding period.
 * The function assumes APR is expressed as a percentage (e.g. 10 for 10%) and returns APY as a percentage.
 */
export function aprToApy(aprPercentage: number, compoundingDays?: number): number
export function aprToApy(
  aprPercentage: number | null | undefined,
  compoundingDays?: number,
): number | null
export function aprToApy(
  aprPercentage: number | null | undefined,
  compoundingDays = AVERAGE_CATEGORIES['llamalend.compoundRate'].window,
): number | null {
  if (aprPercentage == null) return null

  const periods = DAYS_PER_YEAR / compoundingDays
  const compoundedRate = 1 + aprPercentage / 100 / periods

  return (Math.pow(compoundedRate, periods) - 1) * 100
}
