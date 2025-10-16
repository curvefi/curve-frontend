import { useMemo } from 'react'
import { shallow } from 'zustand/shallow'
import { ChartDataPoint } from '@/llamalend/widgets/bands-chart/types'
import type { BandsBalancesData } from '@/llamalend/widgets/bands-chart/types'
import useStore from '@/loan/store/useStore'

export const useBandsData = ({ llammaId }: { llammaId: string }) => {
  const { marketBandsBalances, priceInfo, userBandsBalances, userLiquidationBand } = useStore((state) => {
    const loanDetails = state.loans.detailsMapper[llammaId]
    const userDetails = state.loans.userDetailsMapper[llammaId]
    return {
      marketBandsBalances: loanDetails?.bandsBalances,
      priceInfo: loanDetails?.priceInfo,
      userBandsBalances: userDetails?.userBandsBalances,
      userLiquidationBand: userDetails?.userLiquidationBand,
    }
  }, shallow)

  const { oraclePrice, oraclePriceBand } = priceInfo ?? {}

  const chartData = useMemo(() => {
    // Normalize loan data structure to match lend's structure and the chart's expectations
    const normalize = (band: BandsBalancesData) => ({
      ...band,
      borrowed: band.stablecoin ?? '0',
      collateralBorrowedUsd: band.collateralStablecoinUsd ?? 0,
    })

    const marketBands = marketBandsBalances?.map(normalize) ?? []
    const userBands = userBandsBalances?.map(normalize) ?? []

    const bandsMap = new Map<string, ChartDataPoint>()

    // Add market bands
    marketBands.forEach((band) => {
      const key = String(band.n)
      bandsMap.set(key, {
        n: Number(band.n),
        pUpDownMedian: Number(band.pUpDownMedian),
        p_up: Number(band.p_up),
        p_down: Number(band.p_down),
        bandCollateralAmount: Number(band.collateral ?? '0'),
        bandCollateralValueUsd: Number((band as any).collateralStablecoinUsd ?? 0),
        bandBorrowedAmount: Number((band as any).stablecoin ?? '0'),
        bandBorrowedValueUsd: Number((band as any).stablecoin ?? '0'), // Assuming 1:1 for now
        bandTotalCollateralValueUsd: (band as any).collateralBorrowedUsd ?? 0,
        userBandCollateralAmount: 0,
        userBandCollateralValueUsd: 0,
        userBandBorrowedAmount: 0,
        userBandBorrowedValueUsd: 0,
        userBandTotalCollateralValueUsd: 0,
        isLiquidationBand: band.isLiquidationBand,
        isOraclePriceBand: Number(band.n) === oraclePriceBand,
      })
    })

    // Add user bands
    userBands.forEach((band) => {
      const key = String(band.n)
      const existing = bandsMap.get(key)
      if (existing) {
        existing.userBandCollateralAmount = Number(band.collateral ?? '0')
        existing.userBandCollateralValueUsd = Number((band as any).collateralStablecoinUsd ?? 0)
        existing.userBandBorrowedAmount = Number((band as any).stablecoin ?? '0')
        existing.userBandBorrowedValueUsd = Number((band as any).stablecoin ?? '0')
        existing.userBandTotalCollateralValueUsd = (band as any).collateralBorrowedUsd ?? 0
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
          userBandCollateralAmount: Number(band.collateral ?? '0'),
          userBandCollateralValueUsd: Number((band as any).collateralStablecoinUsd ?? 0),
          userBandBorrowedAmount: Number((band as any).stablecoin ?? '0'),
          userBandBorrowedValueUsd: Number((band as any).stablecoin ?? '0'),
          userBandTotalCollateralValueUsd: (band as any).collateralBorrowedUsd ?? 0,
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

  return {
    chartData,
    userBandsBalances, // Pass original for brush calculation
    liquidationBand: userLiquidationBand,
    oraclePrice,
    oraclePriceBand,
  }
}

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
