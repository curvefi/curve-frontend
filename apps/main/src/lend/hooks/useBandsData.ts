import { PageContentProps } from '@/lend/types/lend.types'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import { useMarketBands } from '@/llamalend/features/bands-chart/queries/market-bands.query'
import { useMarketOraclePrices } from '@/llamalend/features/bands-chart/queries/market-oracle-prices.query'
import { useUserBands } from '@/llamalend/features/bands-chart/queries/user-bands.query'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { useConnection } from '@ui-kit/features/connect-wallet'

const EMPTY_ARRAY: never[] = []

export const useBandsData = ({ rChainId, rOwmId, api }: Pick<PageContentProps, 'rChainId' | 'api' | 'rOwmId'>) => {
  const { wallet } = useConnection()
  const userAddress = wallet?.account.address
  const { data: marketOraclePrices, isLoading: isMarketOraclePricesLoading } = useMarketOraclePrices({
    chainId: rChainId,
    marketId: rOwmId,
  })
  const { data: marketBands, isLoading: isMarketBandsLoading } = useMarketBands({ chainId: rChainId, marketId: rOwmId })
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId: rChainId,
    marketId: rOwmId,
    userAddress,
  })
  const { data: userBands, isLoading: isUserBandsLoading } = useUserBands({
    chainId: rChainId,
    marketId: rOwmId,
    userAddress,
    loanExists: loanExists,
  })
  const chartData = useProcessedBandsData({
    marketBandsBalances: marketBands?.bandsBalances ?? EMPTY_ARRAY,
    userBandsBalances: userBands ?? EMPTY_ARRAY,
    oraclePriceBand: marketOraclePrices?.oraclePriceBand,
  })

  const isLoading =
    !api || isMarketBandsLoading || isUserBandsLoading || isMarketOraclePricesLoading || isLoanExistsLoading

  return {
    isLoading,
    chartData,
    userBandsBalances: userBands ?? EMPTY_ARRAY,
    oraclePrice: marketOraclePrices?.oraclePrice,
  }
}
