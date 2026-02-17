import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import { useMarketBandsBalances } from '@/llamalend/features/bands-chart/queries/market-bands-balances.query'
import { useMarketUserBandsBalances } from '@/llamalend/features/bands-chart/queries/market-user-bands-balances.query'
import { parseFetchedBandsBalances } from '@/llamalend/features/bands-chart/queries/utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { useMarketLiquidationBand } from '@/llamalend/queries/market-liquidation-band.query'
import { useMarketOraclePriceBand } from '@/llamalend/queries/market-oracle-price-band.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market-oracle-price.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LlamaApi } from '@ui-kit/features/connect-wallet'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

export const useBandsData = ({
  chainId,
  marketId,
  api,
  collateralTokenAddress,
  borrowedTokenAddress,
}: {
  chainId: IChainId
  marketId: string
  api: LlamaApi | undefined | null
  collateralTokenAddress: string | undefined
  borrowedTokenAddress: string | undefined
}) => {
  const { isHydrated } = useCurve()
  const { address: userAddress } = useConnection()
  const { data: collateralUsdRate } = useTokenUsdRate({ chainId, tokenAddress: collateralTokenAddress })
  const { data: borrowedUsdRate } = useTokenUsdRate({ chainId, tokenAddress: borrowedTokenAddress })
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId,
    userAddress: userAddress,
  })
  const { data: liquidationBand, isLoading: isLiquidationBandLoading } = useMarketLiquidationBand({
    chainId,
    marketId,
  })
  const { data: userBandsBalances, isLoading: isUserBandsBalancesLoading } = useMarketUserBandsBalances({
    chainId,
    marketId,
    userAddress: userAddress,
    loanExists,
    liquidationBand,
  })
  const { data: oraclePriceBand, isLoading: isMarketOraclePriceBandLoading } = useMarketOraclePriceBand({
    chainId,
    marketId,
  })
  const {
    data: marketBandsBalances,
    isLoading: isMarketBandsBalancesLoading,
    isError: isMarketBandsBalancesError,
  } = useMarketBandsBalances({
    chainId,
    marketId,
    liquidationBand,
    oraclePriceBand,
  })
  const { data: oraclePrice, isLoading: isMarketOraclePriceLoading } = useMarketOraclePrice({
    chainId,
    marketId,
  })

  const parsedUserBandsBalances = useMemo(
    () => parseFetchedBandsBalances(userBandsBalances, collateralUsdRate, borrowedUsdRate),
    [userBandsBalances, collateralUsdRate, borrowedUsdRate],
  )

  const chartData = useProcessedBandsData({
    marketBandsBalances: marketBandsBalances,
    userBandsBalances: parsedUserBandsBalances,
    oraclePriceBand,
    collateralUsdRate,
    borrowedUsdRate,
  })

  const isLoading =
    !isHydrated ||
    !api ||
    isLiquidationBandLoading ||
    isMarketBandsBalancesLoading ||
    isMarketOraclePriceBandLoading ||
    isMarketOraclePriceLoading ||
    isLoanExistsLoading ||
    isUserBandsBalancesLoading

  const isError = isMarketBandsBalancesError

  return {
    isLoading,
    isError,
    chartData,
    userBandsBalances: parsedUserBandsBalances,
    oraclePrice,
  }
}
