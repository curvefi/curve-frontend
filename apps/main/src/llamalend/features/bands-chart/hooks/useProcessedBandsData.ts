import lodash from 'lodash'
import { useMemo } from 'react'
import type { ChartDataPoint, FetchedBandsBalances } from '@/llamalend/features/bands-chart/types'

type ProcessedBandsData = {
  marketBandsBalances: FetchedBandsBalances[] | undefined
  userBandsBalances: FetchedBandsBalances[] | undefined
}

export const useProcessedBandsData = ({ marketBandsBalances, userBandsBalances }: ProcessedBandsData) =>
  useMemo(() => {
    if (!marketBandsBalances) return []

    const marketBands = marketBandsBalances ?? []
    const userBands = userBandsBalances ?? []

    const getBandValues = (band: FetchedBandsBalances) => ({
      collateralAmount: +band.collateral,
      borrowedAmount: +band.borrowed,
      collateralValueUsd: band.collateralUsd,
      borrowedValueUsd: band.collateralBorrowedUsd - band.collateralUsd,
    })

    const marketTuples: [number, ChartDataPoint][] = marketBands.map((band) => {
      const { collateralAmount, borrowedAmount, collateralValueUsd, borrowedValueUsd } = getBandValues(band)

      return [
        band.n,
        {
          n: band.n,
          pUpDownMedian: band.pUpDownMedian,
          p_up: band.p_up,
          p_down: band.p_down,
          bandCollateralAmount: collateralAmount,
          bandCollateralValueUsd: collateralValueUsd,
          bandBorrowedAmount: borrowedAmount,
          bandBorrowedValueUsd: borrowedValueUsd,
          bandTotalCollateralValueUsd:
            typeof collateralValueUsd === 'number' && typeof borrowedValueUsd === 'number'
              ? collateralValueUsd + borrowedValueUsd
              : undefined,
          isLiquidationBand: band.isLiquidationBand,
        },
      ]
    })

    const userTuples: [number, ChartDataPoint][] = userBands.map((band) => {
      const { collateralAmount, borrowedAmount, collateralValueUsd, borrowedValueUsd } = getBandValues(band)
      return [
        band.n,
        {
          n: band.n,
          pUpDownMedian: band.pUpDownMedian,
          p_up: band.p_up,
          p_down: band.p_down,
          userBandCollateralAmount: collateralAmount,
          userBandCollateralValueUsd: collateralValueUsd,
          userBandBorrowedAmount: borrowedAmount,
          userBandBorrowedValueUsd: borrowedValueUsd,
          userBandTotalCollateralValueUsd:
            typeof collateralValueUsd === 'number' && typeof borrowedValueUsd === 'number'
              ? collateralValueUsd + borrowedValueUsd
              : undefined,
          isLiquidationBand: band.isLiquidationBand,
        },
      ]
    })

    const bandsMap = new Map<number, ChartDataPoint>(marketTuples)

    userTuples.forEach(([key, userBandData]) => {
      const existing = bandsMap.get(key)
      if (existing) {
        bandsMap.set(key, { ...existing, ...userBandData })
      } else {
        bandsMap.set(key, userBandData)
      }
    })

    return lodash.orderBy(Array.from(bandsMap.values()), 'pUpDownMedian', 'desc')
  }, [marketBandsBalances, userBandsBalances])
