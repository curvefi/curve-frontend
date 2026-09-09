import { maybe } from './objects.utils'

/** Number of compounding periods per year. */
export const COMPOUNDING_FREQUENCIES = { daily: 365, weekly: 365 / 7, continuous: Infinity } as const

export const COMPOUNDING_PRESETS = {
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
export const aprToApy = <T extends number | null | undefined>(aprPercentage: T, category: CompoundingCategory) =>
  maybe(aprPercentage, aprPercentage => {
    const { frequency } = COMPOUNDING_CATEGORIES[category]
    if (frequency === COMPOUNDING_FREQUENCIES.continuous) return Math.expm1(aprPercentage / 100) * 100

    const compoundedRate = 1 + aprPercentage / 100 / frequency
    return (Math.pow(compoundedRate, frequency) - 1) * 100
  })
