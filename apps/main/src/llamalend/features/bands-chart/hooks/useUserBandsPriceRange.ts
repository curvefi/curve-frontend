import { useMemo } from 'react'
import { ChartDataPoint, UserBandsPriceRange } from '../types'
import { isUserBand } from './useProcessedBandsData'

/**
 * Calculates the user positions price range
 *
 * This is used to:
 * - Draw a highlighted region showing where the user's current position sits
 * - Display price labels at the boundaries of the user's range
 *
 * @param chartData - All available chart data points
 * @returns Price range data or null if user has no positions
 */
export const useUserBandsPriceRange = (chartData: ChartDataPoint[]): UserBandsPriceRange =>
  useMemo(() => {
    const userBands = chartData.filter(isUserBand)

    if (!userBands.length) return null

    const minBand = userBands[userBands.length - 1]
    const maxBand = userBands[0]

    return {
      minUserIdx: chartData.indexOf(minBand),
      maxUserIdx: chartData.indexOf(maxBand),
      upperBandPriceUp: minBand.p_up, // Upper boundary of highest band
      lowerBandPriceDown: maxBand.p_down, // Lower boundary of lowest band
    }
  }, [chartData])
