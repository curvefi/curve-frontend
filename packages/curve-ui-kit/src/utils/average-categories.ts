import { AVERAGES_TYPES } from './averageRates'

const { week, month } = AVERAGES_TYPES

export const AVERAGE_CATEGORIES = {
  // compounding rate frequency to convert APR rates to APY
  'llamalend.compoundRate': week,

  // llamalend market page
  'llamalend.position.supplyRate': month,
  'llamalend.position.borrowRate': month,
  'llamalend.market.supplyRate': month,
  'llamalend.market.borrowRate': month,

  // llamalend table
  'llamalend.marketList.rate': week,
  'llamalend.marketList.chartRate': week,
} as const

export type AverageCategory = keyof typeof AVERAGE_CATEGORIES
