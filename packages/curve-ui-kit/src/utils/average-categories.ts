import { AVERAGES_TYPES } from './averageRates'

const { week, month } = AVERAGES_TYPES

export const AVERAGE_CATEGORIES = {
  'llamalend.borrowRate': month,
  'llamalend.borrowRateTooltip': week,
  'llamalend.supplyRate': month,
  'llamalend.supplyRateTooltip': week,
  'llamalend.supplyCompoundingRate': week,

  'llamalend.marketList.rate': week,
} as const

export type AverageCategory = keyof typeof AVERAGE_CATEGORIES
