import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, formatPercent } from '@ui-kit/utils'

export const UnavailableNotation = '-'

export const formatMetricValue = (value?: number | Decimal | null) => {
  if (value === 0) return '0'
  if (value) return formatNumber(value, { abbreviate: true })
  return UnavailableNotation
}

export const formatPercentage = (
  value: number | undefined | null,
  totalValue: number | undefined | null,
  usdRate: number | undefined | null,
) => {
  if (value === 0) return '0%'
  if (value && totalValue && usdRate) {
    return formatPercent(((value * usdRate) / totalValue) * 100)
  }
  return null
}
