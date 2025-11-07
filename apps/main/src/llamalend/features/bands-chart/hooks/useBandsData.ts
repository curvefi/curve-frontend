import { useAccount } from 'wagmi'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import { useMarketBandsBalances } from '@/llamalend/features/bands-chart/queries/market-bands-balances.query'
import { useMarketUserBandsBalances } from '@/llamalend/features/bands-chart/queries/market-user-bands-balances.query'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { useMarketLiquidationBand } from '@/llamalend/queries/market-liquidation-band.query'
import { useMarketOraclePriceBand } from '@/llamalend/queries/market-oracle-price-band.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market-oracle-price.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LlamaApi } from '@ui-kit/features/connect-wallet'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

export const useBandsData = ({
  chainId,
  llammaId,
  api,
  collateralTokenAddress,
  borrowedTokenAddress,
}: {
  chainId: IChainId
  llammaId: string
  api: LlamaApi | undefined | null
  collateralTokenAddress: string | undefined
  borrowedTokenAddress: string | undefined
}) => {
  const { address: userAddress } = useAccount()
  const { data: collateralUsdRate } = useTokenUsdRate({ chainId, tokenAddress: collateralTokenAddress })
  const { data: borrowedUsdRate } = useTokenUsdRate({ chainId, tokenAddress: borrowedTokenAddress })
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId: llammaId,
    userAddress: userAddress,
  })
  const { data: liquidationBand, isLoading: isLiquidationBandLoading } = useMarketLiquidationBand({
    chainId,
    marketId: llammaId,
  })
  const { data: userBandsBalances, isLoading: isUserBandsBalancesLoading } = useMarketUserBandsBalances({
    chainId,
    marketId: llammaId,
    userAddress: userAddress,
    loanExists,
    liquidationBand,
  })
  const {
    data: marketBandsBalances,
    isLoading: isMarketBandsBalancesLoading,
    isError: isMarketBandsBalancesError,
  } = useMarketBandsBalances({
    chainId,
    marketId: llammaId,
    liquidationBand,
  })
  const { data: oraclePriceBand, isLoading: isMarketOraclePriceBandLoading } = useMarketOraclePriceBand({
    chainId,
    marketId: llammaId,
  })
  const { data: oraclePrice, isLoading: isMarketOraclePriceLoading } = useMarketOraclePrice({
    chainId,
    marketId: llammaId,
  })

  const chartData = useProcessedBandsData({
    marketBandsBalances: marketBandsBalances,
    userBandsBalances: userBandsBalances,
    oraclePriceBand,
    collateralUsdRate: collateralUsdRate ?? null,
    borrowedUsdRate: borrowedUsdRate ?? null,
  })

  const isLoading =
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
    userBandsBalances,
    oraclePrice,
  }
}
