import { useMemo } from 'react'
import { ChartDataPoint, ParsedBandsBalances, UserBandsPriceRange } from '../types'

/**
 * Calculates the user positions price range
 *
 * This is used to:
 * - Draw a highlighted region showing where the user's current position sits
 * - Display price labels at the boundaries of the user's range
 *
 * @param chartData - All available chart data points
 * @param userBandsBalances - User's positions in specific bands
 * @returns Price range data or null if user has no positions
 */
export const useUserBandsPriceRange = (
  chartData: ChartDataPoint[],
  userBandsBalances: ParsedBandsBalances[],
): UserBandsPriceRange =>
  useMemo(() => {
    if (userBandsBalances.length === 0) return null

    const userBandNumbers = new Set(userBandsBalances.map((band) => String(band.n)))
    const userBands = chartData.filter((d) => userBandNumbers.has(String(d.n)))

    if (userBands.length === 0) return null

    const minBand = userBands[userBands.length - 1]
    const maxBand = userBands[0]

    return {
      minUserIdx: chartData.indexOf(minBand),
      maxUserIdx: chartData.indexOf(maxBand),
      upperBandPriceUp: minBand.p_up, // Upper boundary of highest band
      lowerBandPriceDown: maxBand.p_down, // Lower boundary of lowest band
    }
  }, [userBandsBalances, chartData])
