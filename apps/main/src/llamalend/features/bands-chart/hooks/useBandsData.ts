import { useConnection } from 'wagmi'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import { useMarketBandsBalances, useUserBandsBalances } from '@/llamalend/queries/bands'
import { useMarketLiquidationBand, useMarketOraclePrice } from '@/llamalend/queries/market'
import { useLoanExists } from '@/llamalend/queries/user'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'

export const useBandsData = ({
  chainId,
  marketId,
  enabled = true,
}: {
  chainId: IChainId
  marketId: string | undefined
  enabled?: boolean
}) => {
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

  const processedChartData = useProcessedBandsData({
    marketBandsBalances,
    userBandsBalances,
  })

  const isLoading =
    isLiquidationBandLoading ||
    isMarketBandsBalancesLoading ||
    isMarketOraclePriceLoading ||
    isLoanExistsLoading ||
    isUserBandsBalancesLoading

  return { isLoading, error: marketBandsBalancesError, chartData: processedChartData, userBandsBalances, oraclePrice }
}
