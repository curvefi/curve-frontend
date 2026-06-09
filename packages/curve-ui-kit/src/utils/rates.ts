import { AVERAGE_CATEGORIES } from './average-categories'

const DAYS_PER_YEAR = 365

/**
 * Converts an APR into APY using periodic compounding based on a given number of days per compounding period.
 * The function assumes APR is expressed as a percentage (e.g. 10 for 10%) and returns APY as a percentage.
 */
export const aprToApy = (
  aprPercentage: number | null | undefined,
  compoundingDays = AVERAGE_CATEGORIES['llamalend.compoundRate'].window,
): number | null => {
  if (aprPercentage == null) return null

  const periods = DAYS_PER_YEAR / compoundingDays
  const compoundedRate = 1 + aprPercentage / 100 / periods

  return (Math.pow(compoundedRate, periods) - 1) * 100
}
