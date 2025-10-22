import { useMemo } from 'react'
import type { ChartDataPoint, BandsBalancesData } from '@/llamalend/features/bands-chart/types'

type ProcessedBandsData = {
  marketBandsBalances: BandsBalancesData[]
  userBandsBalances: BandsBalancesData[]
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

    const bandsMap = new Map<string, ChartDataPoint>()

    marketBands.forEach((band) => {
      const key = String(band.n)
      bandsMap.set(key, {
        n: Number(band.n),
        pUpDownMedian: Number(band.pUpDownMedian),
        p_up: Number(band.p_up),
        p_down: Number(band.p_down),
        bandCollateralAmount: Number(band.collateral),
        bandCollateralValueUsd: Number(band.collateralUsd ?? band.collateralStablecoinUsd ?? 0),
        bandBorrowedAmount: Number(band.borrowed ?? band.stablecoin ?? '0'),
        bandBorrowedValueUsd: Number(band.borrowed ?? band.stablecoin ?? '0'),
        bandTotalCollateralValueUsd: Number(band.collateralBorrowedUsd ?? 0),
        userBandCollateralAmount: 0,
        userBandCollateralValueUsd: 0,
        userBandBorrowedAmount: 0,
        userBandBorrowedValueUsd: 0,
        userBandTotalCollateralValueUsd: 0,
        isLiquidationBand: band.isLiquidationBand,
        isOraclePriceBand: Number(band.n) === oraclePriceBand,
      })
    })

    userBands.forEach((band) => {
      const key = String(band.n)
      const existing = bandsMap.get(key)
      if (existing) {
        existing.userBandCollateralAmount = Number(band.collateral)
        existing.userBandCollateralValueUsd = Number(band.collateralUsd ?? band.collateralStablecoinUsd ?? 0)
        existing.userBandBorrowedAmount = Number(band.borrowed ?? band.stablecoin ?? '0')
        existing.userBandBorrowedValueUsd = Number(band.borrowed ?? band.stablecoin ?? '0')
        existing.userBandTotalCollateralValueUsd = Number(band.collateralBorrowedUsd ?? 0)
      } else {
        bandsMap.set(key, {
          n: Number(band.n),
          pUpDownMedian: Number(band.pUpDownMedian),
          p_up: Number(band.p_up),
          p_down: Number(band.p_down),
          bandCollateralAmount: 0,
          bandCollateralValueUsd: 0,
          bandBorrowedAmount: 0,
          bandBorrowedValueUsd: 0,
          bandTotalCollateralValueUsd: 0,
          userBandCollateralAmount: Number(band.collateral),
          userBandCollateralValueUsd: Number(band.collateralUsd ?? band.collateralStablecoinUsd ?? 0),
          userBandBorrowedAmount: Number(band.borrowed ?? band.stablecoin ?? '0'),
          userBandBorrowedValueUsd: Number(band.borrowed ?? band.stablecoin ?? '0'),
          userBandTotalCollateralValueUsd: Number(band.collateralBorrowedUsd ?? 0),
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
    d.bandCollateralValueUsd > 0 ||
    d.bandBorrowedValueUsd > 0 ||
    d.isLiquidationBand === 'SL' ||
    d.isOraclePriceBand ||
    d.userBandCollateralValueUsd > 0 ||
    d.userBandBorrowedValueUsd > 0
  )
}
