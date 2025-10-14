import { useMemo } from 'react'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import useStore from '@/loan/store/useStore'
import { Llamma } from '@/loan/types/loan.types'

export const useBandsData = ({ llammaId, llamma }: { llammaId: string; llamma: Llamma }) => {
  const { bandsBalances: marketBandsBalances, priceInfo } = useStore(
    (state) => state.loans.detailsMapper[llammaId] ?? {},
  )

  const { oraclePrice, oraclePriceBand } = priceInfo ?? {}
  const { userBandsBalances, userLiquidationBand } = useUserLoanDetails(llammaId) ?? {}

  // TODO: normalize the original type between lend and loan so there won't be a need to parse
  const parsedUserBandsBalances = useMemo(() => {
    if (!userBandsBalances) return []
    return userBandsBalances.map(({ collateralStablecoinUsd, stablecoin, ...band }) => ({
      ...band,
      collateralBorrowedUsd: collateralStablecoinUsd,
      borrowed: stablecoin,
    }))
  }, [userBandsBalances])
  const parsedMarketBandsBalances = useMemo(() => {
    if (!marketBandsBalances) return []
    return marketBandsBalances.map(({ collateralStablecoinUsd, stablecoin, ...band }) => ({
      ...band,
      collateralBorrowedUsd: collateralStablecoinUsd,
      borrowed: stablecoin,
    }))
  }, [marketBandsBalances])

  return {
    userBandsBalances: parsedUserBandsBalances,
    marketBandsBalances: parsedMarketBandsBalances,
    liquidationBand: userLiquidationBand,
    oraclePrice,
    oraclePriceBand,
  }
}
