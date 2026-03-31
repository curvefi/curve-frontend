import { Amount } from '@primitives/decimal.utils'
import { formatNumber, formatPercent } from '@ui-kit/utils'

export const UnavailableNotation = '-'

export const formatMetricValue = (value: Amount | null | undefined) =>
  value == null ? UnavailableNotation : formatNumber(value, { abbreviate: true })

// Returns null instead of UnavailableNotation to prevent showing UnavailableNotation twice
export const formatPercentage = (
  value: number | undefined | null,
  totalValue: number | undefined | null,
  usdRate: number | undefined | null,
) => (totalValue && value != null && usdRate != null ? formatPercent(((value * usdRate) / totalValue) * 100) : null)
