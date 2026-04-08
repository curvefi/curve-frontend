import { AVERAGES_TYPES } from './averageRates'

const { week, month } = AVERAGES_TYPES

/**
 * Centralized categories for averaged values.
 *
 * Each category points to the shared configuration used for that average, such as the time window and labels.
 * This keeps average-based values consistent across the app and makes it possible to update their labels or
 * time windows in one place.
 *
 * Format: 'app.surface.metric'.
 */
export const AVERAGE_CATEGORIES = {
  // compounding rate frequency to convert APR rates to APY
  'llamalend.compoundRate': week,

  // llamalend market page
  'llamalend.market.rate': month,

  // llamalend table
  'llamalend.marketList.rate': week,
} as const

export type AverageCategory = keyof typeof AVERAGE_CATEGORIES
