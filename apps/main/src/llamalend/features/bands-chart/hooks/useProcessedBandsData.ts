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
    const hasCollateralRate = typeof collateralUsdRate === 'number' && Number.isFinite(collateralUsdRate)
    const hasBorrowedRate = typeof borrowedUsdRate === 'number' && Number.isFinite(borrowedUsdRate)

    const getBandValues = (band: FetchedBandsBalances) => {
      const collateralAmount = Number(band.collateral)
      const borrowedAmount = Number(band.borrowed)

      const collateralValueUsd = hasCollateralRate ? collateralAmount * collateralUsdRate : undefined
      const borrowedValueUsd = hasBorrowedRate ? borrowedAmount * borrowedUsdRate : undefined

      return { collateralAmount, borrowedAmount, collateralValueUsd, borrowedValueUsd }
    }

    const marketTuples: [number, ChartDataPoint][] = marketBands.map((band) => {
      const { collateralAmount, borrowedAmount, collateralValueUsd, borrowedValueUsd } = getBandValues(band)

      return [
        band.n,
        {
          n: Number(band.n),
          pUpDownMedian: Number(band.pUpDownMedian),
          p_up: Number(band.p_up),
          p_down: Number(band.p_down),
          bandCollateralAmount: collateralAmount,
          bandCollateralValueUsd: collateralValueUsd,
          bandBorrowedAmount: borrowedAmount,
          bandBorrowedValueUsd: borrowedValueUsd,
          bandTotalCollateralValueUsd:
            collateralValueUsd === undefined && borrowedValueUsd === undefined
              ? undefined
              : (collateralValueUsd ?? 0) + (borrowedValueUsd ?? 0),
          isLiquidationBand: band.isLiquidationBand,
          isOraclePriceBand: Number(band.n) === oraclePriceBand,
        },
      ]
    })

    const bandsMap = new Map<number, ChartDataPoint>(marketTuples)

    userBands.forEach((band) => {
      const key = band.n
      const existing = bandsMap.get(key)
      const { collateralAmount, borrowedAmount, collateralValueUsd, borrowedValueUsd } = getBandValues(band)

      if (existing) {
        existing.userBandCollateralAmount = collateralAmount
        existing.userBandCollateralValueUsd = collateralValueUsd
        existing.userBandBorrowedAmount = borrowedAmount
        existing.userBandBorrowedValueUsd = borrowedValueUsd
        existing.userBandTotalCollateralValueUsd =
          collateralValueUsd === undefined && borrowedValueUsd === undefined
            ? undefined
            : (collateralValueUsd ?? 0) + (borrowedValueUsd ?? 0)
        return
      }

      bandsMap.set(key, {
        n: Number(band.n),
        pUpDownMedian: Number(band.pUpDownMedian),
        p_up: Number(band.p_up),
        p_down: Number(band.p_down),
        userBandCollateralAmount: collateralAmount,
        userBandCollateralValueUsd: collateralValueUsd,
        userBandBorrowedAmount: borrowedAmount,
        userBandBorrowedValueUsd: borrowedValueUsd,
        userBandTotalCollateralValueUsd:
          collateralValueUsd === undefined && borrowedValueUsd === undefined
            ? undefined
            : (collateralValueUsd ?? 0) + (borrowedValueUsd ?? 0),
        isLiquidationBand: band.isLiquidationBand,
        isOraclePriceBand: Number(band.n) === oraclePriceBand,
      })
    })

    const parsedData = Array.from(bandsMap.values())
    const firstDataIdx = parsedData.findIndex(_findDataIndex)
    const lastDataIdx = parsedData.findLastIndex(_findDataIndex)

    if (firstDataIdx === -1) {
      return parsedData.sort((a, b) => b.pUpDownMedian - a.pUpDownMedian)
    }

    const slicedData = parsedData.slice(firstDataIdx, lastDataIdx + 1)
    return slicedData.sort((a, b) => b.pUpDownMedian - a.pUpDownMedian)
  }, [marketBandsBalances, userBandsBalances, oraclePriceBand, collateralUsdRate, borrowedUsdRate])

function _findDataIndex(d: ChartDataPoint) {
  return (
    (d.bandCollateralValueUsd ?? 0) > 0 ||
    (d.bandBorrowedValueUsd ?? 0) > 0 ||
    d.isLiquidationBand === 'SL' ||
    d.isOraclePriceBand ||
    (d.userBandCollateralValueUsd ?? 0) > 0 ||
    (d.userBandBorrowedValueUsd ?? 0) > 0
  )
}
