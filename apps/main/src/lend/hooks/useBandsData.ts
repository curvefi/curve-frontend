import { PageContentProps } from '@/lend/types/lend.types'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import { useMarketBands } from '@/llamalend/features/bands-chart/queries/market-bands.query'
import { useMarketOraclePrices } from '@/llamalend/features/bands-chart/queries/market-oracle-prices.query'
import { useUserBands } from '@/llamalend/features/bands-chart/queries/user-bands.query'
import { useLoanExists } from '@/llamalend/queries/loan-exists'

export const useBandsData = ({ rChainId, rOwmId, api }: Pick<PageContentProps, 'rChainId' | 'api' | 'rOwmId'>) => {
  const { data: marketOraclePrices } = useMarketOraclePrices({ chainId: rChainId, marketId: rOwmId })
  const { data: marketBands } = useMarketBands({ chainId: rChainId, marketId: rOwmId })
  const { data: loanExists } = useLoanExists({ chainId: rChainId, marketId: rOwmId, userAddress: api?.signerAddress })
  const { data: userBands } = useUserBands({
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

  return {
    chartData,
    userBandsBalances: userBands ?? [],
    liquidationBand: marketBands?.liquidationBand,
    oraclePrice: marketOraclePrices?.oraclePrice,
    oraclePriceBand: marketOraclePrices?.oraclePriceBand,
  }
}
