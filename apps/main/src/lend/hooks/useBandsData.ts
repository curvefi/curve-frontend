import { PageContentProps } from '@/lend/types/lend.types'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import { useMarketBands } from '@/llamalend/features/bands-chart/queries/market-bands.query'
import { useUserBands } from '@/llamalend/features/bands-chart/queries/user-bands.query'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { useMarketOraclePriceBand } from '@/llamalend/queries/market-oracle-price-band.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market-oracle-price.query'
import { useConnection } from '@ui-kit/features/connect-wallet'

const EMPTY_ARRAY: never[] = []

export const useBandsData = ({ rChainId, rOwmId, api }: Pick<PageContentProps, 'rChainId' | 'api' | 'rOwmId'>) => {
  const { wallet } = useConnection()
  const userAddress = wallet?.account.address
  const { data: oraclePriceBand, isLoading: isOraclePriceBandLoading } = useMarketOraclePriceBand({
    chainId: rChainId,
    marketId: rOwmId,
  })
  const { data: oraclePrice, isLoading: isOraclePriceLoading } = useMarketOraclePrice({
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
    oraclePriceBand,
  })

  const isLoading =
    !api ||
    isMarketBandsLoading ||
    isUserBandsLoading ||
    isOraclePriceBandLoading ||
    isOraclePriceLoading ||
    isLoanExistsLoading

  return {
    isLoading,
    chartData,
    userBandsBalances: userBands ?? EMPTY_ARRAY,
    oraclePrice,
  }
}
