import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import { useMarketBands } from '@/llamalend/features/bands-chart/queries/market-bands.query'
import { useMarketOraclePrices } from '@/llamalend/features/bands-chart/queries/market-oracle-prices.query'
import { useUserBands } from '@/llamalend/features/bands-chart/queries/user-bands.query'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { type LlamaApi } from '@ui-kit/features/connect-wallet'

export const useBandsData = ({
  chainId,
  llammaId,
  api,
}: {
  chainId: number
  llammaId: string
  api: LlamaApi | undefined
}) => {
  const { data: marketBands, isLoading: isMarketBandsLoading } = useMarketBands({ chainId, marketId: llammaId })
  const { data: marketOraclePrices, isLoading: isMarketOraclePricesLoading } = useMarketOraclePrices({
    chainId,
    marketId: llammaId,
  })
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId: llammaId,
    userAddress: api?.signerAddress,
  })
  const { data: userBands, isLoading: isUserBandsLoading } = useUserBands({
    chainId,
    marketId: llammaId,
    userAddress: api?.signerAddress,
    loanExists: loanExists,
  })

  const marketBandsBalances = marketBands?.bandsBalances

  const { oraclePrice, oraclePriceBand } = marketOraclePrices ?? {}

  const chartData = useProcessedBandsData({
    marketBandsBalances: marketBandsBalances ?? [],
    userBandsBalances: userBands ?? [],
    oraclePriceBand,
  })

  const isLoading =
    !api || isMarketBandsLoading || isMarketOraclePricesLoading || isLoanExistsLoading || isUserBandsLoading

  return {
    isLoading,
    chartData,
    userBands,
    oraclePrice,
  }
}
