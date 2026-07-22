import { Amount } from '@primitives/decimal.utils'
import { formatNumber } from '@ui-kit/utils'

export const UNAVAILABLE_NOTATION = '-'
export const UNAVAILABLE_TOKEN_SYMBOL = '?'

export const formatMetricValue = (value: Amount | null | undefined) =>
  value == null ? UNAVAILABLE_NOTATION : formatNumber(value, { abbreviate: true })

/** Returns null instead of UNAVAILABLE_NOTATION to prevent showing UNAVAILABLE_NOTATION twice */
export const formatPercentage = (
  value: Amount | undefined | null,
  totalValue: Amount | undefined | null,
  // Converts value into the same denomination as totalValue.
  conversionRate: Amount | undefined | null,
) =>
  totalValue && value != null && conversionRate != null
    ? formatNumber(((+value * +conversionRate) / +totalValue) * 100, 'percent.rate')
    : null
