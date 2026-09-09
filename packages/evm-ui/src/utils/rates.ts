import type { Amount } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'

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
