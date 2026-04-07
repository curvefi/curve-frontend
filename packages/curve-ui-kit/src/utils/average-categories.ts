import { AVERAGES_TYPES } from './averageRates'

const { week, month } = AVERAGES_TYPES

/**
 * This is the final level of categorization for averages.
 * Format: 'app.location.feature'.
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
