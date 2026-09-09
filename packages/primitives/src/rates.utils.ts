/** Number of compounding periods per year. */
export const COMPOUNDING_FREQUENCIES = {
  // 365 + 1/4 approximates one leap day every four years.
  daily36525: 365.25,
  weekly: 365 / 7,
  continuous: Infinity,
} as const

export const COMPOUNDING_PRESETS = {
  daily36525: { frequency: COMPOUNDING_FREQUENCIES.daily36525, adjective: 'daily' },
  weekly: { frequency: COMPOUNDING_FREQUENCIES.weekly, adjective: 'weekly' },
  continuous: { frequency: COMPOUNDING_FREQUENCIES.continuous, adjective: 'continuous' },
} as const

export const COMPOUNDING_CATEGORIES = {
  // CRV gauge rewards (including boosts), extra token incentives, and Merkl campaign rewards.
  'llamalend.rewards': COMPOUNDING_PRESETS.weekly,
  'llamalend.borrow': COMPOUNDING_PRESETS.continuous,
  'savings.supply': COMPOUNDING_PRESETS.daily36525,
} as const

export type CompoundingCategory = keyof typeof COMPOUNDING_CATEGORIES

/** Converts APR percentage to APY percentage using the category's compounding frequency. */
export function aprToApy(aprPercentage: number, category: CompoundingCategory): number
export function aprToApy(aprPercentage: number | null | undefined, category: CompoundingCategory): number | null
export function aprToApy(aprPercentage: number | null | undefined, category: CompoundingCategory): number | null {
  if (aprPercentage == null) return null

  const { frequency } = COMPOUNDING_CATEGORIES[category]
  if (frequency === COMPOUNDING_FREQUENCIES.continuous) return Math.expm1(aprPercentage / 100) * 100

  const compoundedRate = 1 + aprPercentage / 100 / frequency
  return (Math.pow(compoundedRate, frequency) - 1) * 100
}
