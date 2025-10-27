import { useMemo } from 'react'
import type { ChartDataPoint, ParsedBandsBalances } from '@/llamalend/features/bands-chart/types'

type ProcessedBandsData = {
  marketBandsBalances: ParsedBandsBalances[]
  userBandsBalances: ParsedBandsBalances[]
  oraclePriceBand: number | null | undefined
}

export const useProcessedBandsData = ({
  marketBandsBalances,
  userBandsBalances,
  oraclePriceBand,
}: ProcessedBandsData) =>
  useMemo(() => {
    const marketBands = marketBandsBalances ?? []
    const userBands = userBandsBalances ?? []

    const marketTuples: [string, ChartDataPoint][] = marketBands.map((band) => [
      String(band.n),
      {
        n: Number(band.n),
        pUpDownMedian: Number(band.pUpDownMedian),
        p_up: Number(band.p_up),
        p_down: Number(band.p_down),
        bandCollateralAmount: Number(band.collateral),
        bandCollateralValueUsd: Number(band.collateralUsd),
        bandBorrowedAmount: Number(band.borrowed ?? 0),
        bandBorrowedValueUsd: Number(band.collateralBorrowedUsd ?? 0),
        bandTotalCollateralValueUsd: Number(band.collateralBorrowedUsd ?? 0) + Number(band.collateralUsd ?? 0),
        isLiquidationBand: band.isLiquidationBand,
        isOraclePriceBand: Number(band.n) === oraclePriceBand,
      },
    ])

    const bandsMap = new Map<string, ChartDataPoint>(marketTuples)

    userBands.forEach((band) => {
      const key = String(band.n)
      const existing = bandsMap.get(key)
      if (existing) {
        existing.userBandCollateralAmount = Number(band.collateral)
        existing.userBandCollateralValueUsd = Number(band.collateralUsd)
        existing.userBandBorrowedAmount = Number(band.borrowed)
        existing.userBandBorrowedValueUsd = Number(band.collateralBorrowedUsd)
        existing.userBandTotalCollateralValueUsd = Number(band.collateralBorrowedUsd) + Number(band.collateralUsd)
      } else {
        bandsMap.set(key, {
          n: Number(band.n),
          pUpDownMedian: Number(band.pUpDownMedian),
          p_up: Number(band.p_up),
          p_down: Number(band.p_down),
          userBandCollateralAmount: Number(band.collateral),
          userBandCollateralValueUsd: Number(band.collateralUsd),
          userBandBorrowedAmount: Number(band.borrowed),
          userBandBorrowedValueUsd: Number(band.collateralBorrowedUsd),
          userBandTotalCollateralValueUsd: Number(band.collateralBorrowedUsd) + Number(band.collateralUsd),
          isLiquidationBand: band.isLiquidationBand,
          isOraclePriceBand: Number(band.n) === oraclePriceBand,
        })
      }
    })

    const parsedData = Array.from(bandsMap.values())
    const firstDataIdx = parsedData.findIndex(_findDataIndex)
    const lastDataIdx = parsedData.findLastIndex(_findDataIndex)

    if (firstDataIdx === -1) {
      return parsedData.sort((a, b) => b.pUpDownMedian - a.pUpDownMedian)
    }

    const slicedData = parsedData.slice(firstDataIdx, lastDataIdx + 1)
    return slicedData.sort((a, b) => b.pUpDownMedian - a.pUpDownMedian)
  }, [marketBandsBalances, userBandsBalances, oraclePriceBand])

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
