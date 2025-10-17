import { useMemo } from 'react'
import { shallow } from 'zustand/shallow'
import { BandsBalancesData } from '@/llamalend/widgets/bands-chart/types'
import useStore from '@/loan/store/useStore'
import { useProcessedBandsData } from '@/llamalend/hooks/useBandsData'

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

  const normalizedMarketBands = useMemo(
    () =>
      marketBandsBalances?.map((band: BandsBalancesData) => ({
        ...band,
        borrowed: band.stablecoin ?? '0',
        collateralUsd: String(band.collateralStablecoinUsd ?? 0),
      })) ?? [],
    [marketBandsBalances],
  )

  const normalizedUserBands = useMemo(
    () =>
      userBandsBalances?.map((band: BandsBalancesData) => ({
        ...band,
        borrowed: band.stablecoin ?? '0',
        collateralUsd: String(band.collateralStablecoinUsd ?? 0),
      })) ?? [],
    [userBandsBalances],
  )

  const chartData = useProcessedBandsData({
    marketBandsBalances: normalizedMarketBands,
    userBandsBalances: normalizedUserBands,
    oraclePriceBand,
  })

  return {
    chartData,
    userBandsBalances, // Pass original for brush calculation
    liquidationBand: userLiquidationBand,
    oraclePrice,
    oraclePriceBand,
  }
}
