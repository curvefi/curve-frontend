import { Amount } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'

/** Returns null instead of UNAVAILABLE_NOTATION to prevent showing UNAVAILABLE_NOTATION twice */
export const formatPercentage = (
  value: Amount | Nullish,
  totalValue: Amount | Nullish,
  // Converts value into the same denomination as totalValue.
  conversionRate?: Amount | null,
) =>
  totalValue && value != null
    ? formatNumber(((+value * +(conversionRate ?? '1')) / +totalValue) * 100, 'percent.rate')
    : null
