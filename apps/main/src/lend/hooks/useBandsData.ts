import { PageContentProps } from '@/lend/types/lend.types'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import { useMarketBands } from '@/llamalend/features/bands-chart/queries/market-bands.query'
import { useMarketOraclePrices } from '@/llamalend/features/bands-chart/queries/market-oracle-prices.query'
import { useUserBands } from '@/llamalend/features/bands-chart/queries/user-bands.query'
import { useLoanExists } from '@/llamalend/queries/loan-exists'

export const useBandsData = ({ rChainId, rOwmId, api }: Pick<PageContentProps, 'rChainId' | 'api' | 'rOwmId'>) => {
  const { data: marketOraclePrices, isLoading: isMarketOraclePricesLoading } = useMarketOraclePrices({
    chainId: rChainId,
    marketId: rOwmId,
  })
  const { data: marketBands, isLoading: isMarketBandsLoading } = useMarketBands({ chainId: rChainId, marketId: rOwmId })
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId: rChainId,
    marketId: rOwmId,
    userAddress: api?.signerAddress,
  })
  const { data: userBands, isLoading: isUserBandsLoading } = useUserBands({
    chainId: rChainId,
    marketId: rOwmId,
    userAddress: api?.signerAddress,
    loanExists: loanExists,
  })

  const chartData = useProcessedBandsData({
    marketBandsBalances: marketBands?.bandsBalances ?? [],
    userBandsBalances: userBands ?? [],
    oraclePriceBand: marketOraclePrices?.oraclePriceBand,
  })

  const isLoading = isMarketBandsLoading || isUserBandsLoading || isMarketOraclePricesLoading || isLoanExistsLoading

  return {
    isLoading,
    chartData,
    userBandsBalances: userBands ?? [],
    liquidationBand: marketBands?.liquidationBand,
    oraclePrice: marketOraclePrices?.oraclePrice,
    oraclePriceBand: marketOraclePrices?.oraclePriceBand,
  }
}
