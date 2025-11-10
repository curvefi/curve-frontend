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

    const parsedData = Array.from(bandsMap.values())
    const firstDataIdx = parsedData.findIndex(_findDataIndex)
    const lastDataIdx = parsedData.findLastIndex(_findDataIndex)
    const oracleIdx = parsedData.findIndex((d) => d.isOraclePriceBand)

    if (firstDataIdx === -1) {
      return parsedData.sort((a, b) => b.pUpDownMedian - a.pUpDownMedian)
    }

    // Expand slice to include a small neighborhood around the oracle band in order to always show oracle price mark line
    const neighborhood = 1
    const leftOracleIdx = oracleIdx !== -1 ? Math.max(0, oracleIdx - neighborhood) : firstDataIdx
    const rightOracleIdx = oracleIdx !== -1 ? Math.min(parsedData.length - 1, oracleIdx + neighborhood) : lastDataIdx
    const sliceStartIdx = Math.min(firstDataIdx, leftOracleIdx)
    const sliceEndIdx = Math.max(lastDataIdx, rightOracleIdx)

    const slicedData = parsedData.slice(sliceStartIdx, sliceEndIdx + 1)
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
