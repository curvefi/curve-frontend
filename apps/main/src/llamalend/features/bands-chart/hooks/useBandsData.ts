import { useConnection } from 'wagmi'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import { useMarketBandsBalances, useUserBandsBalances } from '@/llamalend/queries/bands'
import { useMarketLiquidationBand, useMarketOraclePrice } from '@/llamalend/queries/market'
import { useLoanExists } from '@/llamalend/queries/user'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LlamaApi } from '@ui-kit/features/connect-wallet'
import { useCurve } from '@ui-kit/features/connect-wallet'

export const useBandsData = ({
  chainId,
  marketId,
  api,
  enabled = true,
}: {
  chainId: IChainId
  marketId: string
  api: LlamaApi | undefined | null
  enabled?: boolean
}) => {
  const { isHydrated } = useCurve()
  const { address: userAddress } = useConnection()
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists(
    { chainId, marketId, userAddress },
    enabled,
  )
  const { data: liquidationBand, isLoading: isLiquidationBandLoading } = useMarketLiquidationBand(
    { chainId, marketId },
    enabled,
  )
  const { data: userBandsBalances, isLoading: isUserBandsBalancesLoading } = useUserBandsBalances(
    { chainId, marketId, userAddress, loanExists, liquidationBand },
    enabled,
  )
  const {
    data: marketBandsBalances,
    isLoading: isMarketBandsBalancesLoading,
    error: marketBandsBalancesError,
  } = useMarketBandsBalances({ chainId, marketId, liquidationBand }, enabled)
  const { data: oraclePrice, isLoading: isMarketOraclePriceLoading } = useMarketOraclePrice(
    { chainId, marketId },
    enabled,
  )

  const chartData = useProcessedBandsData({
    marketBandsBalances,
    userBandsBalances,
  })

  const isLoading =
    !isHydrated ||
    !api ||
    isLiquidationBandLoading ||
    isMarketBandsBalancesLoading ||
    isMarketOraclePriceLoading ||
    isLoanExistsLoading ||
    isUserBandsBalancesLoading

  return {
    isLoading,
    error: marketBandsBalancesError,
    chartData,
    userBandsBalances,
    oraclePrice,
  }
}
