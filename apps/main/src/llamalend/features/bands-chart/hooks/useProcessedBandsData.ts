import { useMemo } from 'react'
import type { ChartDataPoint, FetchedBandsBalances } from '@/llamalend/features/bands-chart/types'
import { sortBy } from '@primitives/array.utils'

type ProcessedBandsData = {
  marketBandsBalances: FetchedBandsBalances[] | undefined
  userBandsBalances: FetchedBandsBalances[] | undefined
}

export const useProcessedBandsData = ({ marketBandsBalances, userBandsBalances }: ProcessedBandsData) =>
  useMemo(() => {
    if (!marketBandsBalances) return []

    const userBands = userBandsBalances ?? []

    const marketTuples: [number, ChartDataPoint][] = marketBandsBalances.map(band => [
      band.n,
      {
        n: band.n,
        pUpDownMedian: Number(band.pUpDownMedian),
        p_up: Number(band.p_up),
        p_down: Number(band.p_down),
        bandCollateralAmount: band.collateral,
        bandCollateralValue: band.collateralValue,
        bandBorrowedAmount: band.borrowed,
        bandTotalValue: band.totalValue,
        isLiquidationBand: band.isLiquidationBand,
      },
    ])

    const userTuples: [number, ChartDataPoint][] = userBands.map(band => [
      band.n,
      {
        n: band.n,
        pUpDownMedian: Number(band.pUpDownMedian),
        p_up: Number(band.p_up),
        p_down: Number(band.p_down),
        userBandCollateralAmount: band.collateral,
        userBandCollateralValue: band.collateralValue,
        userBandBorrowedAmount: band.borrowed,
        userBandTotalValue: band.totalValue,
        isLiquidationBand: band.isLiquidationBand,
      },
    ])

    const bandsMap = new Map<number, ChartDataPoint>(marketTuples)

    userTuples.forEach(([key, userBandData]) => {
      const existing = bandsMap.get(key)
      if (existing) {
        bandsMap.set(key, { ...existing, ...userBandData })
      } else {
        bandsMap.set(key, userBandData)
      }
    })

    return sortBy(Array.from(bandsMap.values()), d => d.pUpDownMedian, 'desc')
  }, [marketBandsBalances, userBandsBalances])
