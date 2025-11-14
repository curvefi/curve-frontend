import { useMemo } from 'react'
import type { ChartDataPoint, FetchedBandsBalances } from '@/llamalend/features/bands-chart/types'

type ProcessedBandsData = {
  marketBandsBalances: FetchedBandsBalances[] | undefined
  userBandsBalances: FetchedBandsBalances[] | undefined
  oraclePriceBand: number | null | undefined
  collateralUsdRate: number | null | undefined
  borrowedUsdRate: number | null | undefined
}

export const useProcessedBandsData = ({
  marketBandsBalances,
  userBandsBalances,
  oraclePriceBand,
  collateralUsdRate,
  borrowedUsdRate,
}: ProcessedBandsData) =>
  useMemo(() => {
    if (!marketBandsBalances && !userBandsBalances) return []

    const marketBands = marketBandsBalances ?? []
    const userBands = userBandsBalances ?? []
    const hasCollateralRate =
      typeof collateralUsdRate === 'number' && Number.isFinite(collateralUsdRate) && collateralUsdRate > 0
    const hasBorrowedRate =
      typeof borrowedUsdRate === 'number' && Number.isFinite(borrowedUsdRate) && borrowedUsdRate > 0

    const getBandValues = (band: FetchedBandsBalances) => {
      const collateralAmount = Number(band.collateral)
      const borrowedAmount = Number(band.borrowed)

      const collateralValueUsd = hasCollateralRate ? collateralAmount * collateralUsdRate : band.collateralUsd
      const borrowedValueUsd = hasBorrowedRate ? borrowedAmount * borrowedUsdRate : band.collateralBorrowedUsd

      return { collateralAmount, borrowedAmount, collateralValueUsd, borrowedValueUsd }
    }

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
          isOraclePriceBand: band.n === oraclePriceBand,
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
          isOraclePriceBand: band.n === oraclePriceBand,
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

    return Array.from(bandsMap.values()).sort((a, b) => b.pUpDownMedian - a.pUpDownMedian)
  }, [marketBandsBalances, userBandsBalances, oraclePriceBand, collateralUsdRate, borrowedUsdRate])
