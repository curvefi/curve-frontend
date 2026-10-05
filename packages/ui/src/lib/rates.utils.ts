import type { Amount } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { type Nullish, maybe } from '@primitives/objects.utils'

export const MAX_DISPLAY_RATE_PERCENT = 5000

/** Number of compounding periods per year. */
const COMPOUNDING_FREQUENCIES = { daily: 365, weekly: 365 / 7, continuous: Infinity } as const

const COMPOUNDING_PRESETS = {
  daily: { frequency: COMPOUNDING_FREQUENCIES.daily, adjective: 'daily' },
  weekly: { frequency: COMPOUNDING_FREQUENCIES.weekly, adjective: 'weekly' },
  continuous: { frequency: COMPOUNDING_FREQUENCIES.continuous, adjective: 'continuous' },
} as const

export const COMPOUNDING_CATEGORIES = {
  // CRV gauge rewards (including boosts), extra token incentives, and Merkl campaign rewards.
  'llamalend.rewards': COMPOUNDING_PRESETS.weekly,
  'llamalend.borrow': COMPOUNDING_PRESETS.continuous,
  'savings.supply': COMPOUNDING_PRESETS.daily,
} as const

export type CompoundingCategory = keyof typeof COMPOUNDING_CATEGORIES

/** Converts APR percentage to APY percentage using the category's compounding frequency. */
export const aprToApy = <T extends number | Nullish>(aprPercentage: T, category: CompoundingCategory) =>
  maybe(aprPercentage, aprPercentage => {
    const { frequency } = COMPOUNDING_CATEGORIES[category]
    if (frequency === COMPOUNDING_FREQUENCIES.continuous) return Math.expm1(aprPercentage / 100) * 100

    const compoundedRate = 1 + aprPercentage / 100 / frequency
    return (Math.pow(compoundedRate, frequency) - 1) * 100
  })

/** Formats a rate without its percent unit while capping impractically large values. */
export const formatCappedRateValue = (value: Amount) => {
  const numericValue = Number(value)
  if (numericValue >= MAX_DISPLAY_RATE_PERCENT) {
    const cappedValue = formatNumber(MAX_DISPLAY_RATE_PERCENT, { abbreviate: false })
    return `${cappedValue}${numericValue > MAX_DISPLAY_RATE_PERCENT ? '+' : ''}`
  }

  return formatNumber(value, { abbreviate: true })
}

export const formatCappedRatePercent = (value: Amount | Nullish) =>
  value != null && Number(value) >= MAX_DISPLAY_RATE_PERCENT
    ? `${formatCappedRateValue(value)}%`
    : formatNumber(value, 'percent.rate')
