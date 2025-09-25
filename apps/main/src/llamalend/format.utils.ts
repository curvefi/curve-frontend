import { formatNumber, type PreciseNumber } from '@ui-kit/utils'

/** Common percentage formatter across the board for most llamalend percentages */
export const formatPercent = (value: PreciseNumber | number | null | undefined) =>
  formatNumber(value || 0, {
    unit: 'percentage',
    abbreviate: true,
    // Disregard the precision edge case around 0 and 1 and force using 2 decimals
    minimumFractionDigits: 2,
    maximumSignificantDigits: undefined,
  })
