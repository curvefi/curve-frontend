/** Compounding periods per year and their display labels, grouped by the purpose of the rate. */
export const COMPOUNDING_CATEGORIES = {
  'llamalend.rewards': { frequency: 365 / 7, adjective: 'weekly' },
  'llamalend.borrow': { frequency: Infinity, adjective: 'continuous' },
  // Preserve the savings vault's existing 365.25-day annualization convention.
  'savings.supply': { frequency: 365.25, adjective: 'daily' },
} as const

export type CompoundingCategory = keyof typeof COMPOUNDING_CATEGORIES

/** Converts APR percentage points to APY percentage points using the category's compounding frequency. */
export function aprToApy(aprPercentage: number, category: CompoundingCategory): number
export function aprToApy(aprPercentage: number | null | undefined, category: CompoundingCategory): number | null
export function aprToApy(aprPercentage: number | null | undefined, category: CompoundingCategory): number | null {
  if (aprPercentage == null) return null

  const { frequency } = COMPOUNDING_CATEGORIES[category]
  if (frequency === Infinity) return Math.expm1(aprPercentage / 100) * 100

  const compoundedRate = 1 + aprPercentage / 100 / frequency
  return (Math.pow(compoundedRate, frequency) - 1) * 100
}
