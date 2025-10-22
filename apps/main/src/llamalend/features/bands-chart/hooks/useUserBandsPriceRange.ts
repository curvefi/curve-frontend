import { useMemo } from 'react'
import { ChartDataPoint, BandsBalancesData, UserBandsPriceRange } from '../types'

export const useUserBandsPriceRange = (
  chartData: ChartDataPoint[],
  userBandsBalances: BandsBalancesData[],
): UserBandsPriceRange =>
  useMemo(() => {
    if (userBandsBalances.length === 0) return null

    const userBandNumbers = new Set(userBandsBalances.map((band) => String(band.n)))
    const userBands = chartData.filter((d) => userBandNumbers.has(String(d.n)))

    if (userBands.length === 0) return null

    const minBand = userBands[userBands.length - 1] // Highest price (last in sorted array)
    const maxBand = userBands[0] // Lowest price (first in sorted array)

    return {
      minUserIdx: chartData.indexOf(minBand),
      maxUserIdx: chartData.indexOf(maxBand),
      upperBandPriceUp: minBand.p_up,
      lowerBandPriceDown: maxBand.p_down,
    }
  }, [userBandsBalances, chartData])
