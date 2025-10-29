import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import { useMarketBandsBalances } from '@/llamalend/features/bands-chart/queries/market-bands-balances.query'
import { useMarketUserBandsBalances } from '@/llamalend/features/bands-chart/queries/market-user-bands-balances.query'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { useMarketLiquidationBand } from '@/llamalend/queries/market-liquidation-band.query'
import { useMarketOraclePriceBand } from '@/llamalend/queries/market-oracle-price-band.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market-oracle-price.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useConnection, type LlamaApi } from '@ui-kit/features/connect-wallet'

export const useBandsData = ({
  chainId,
  llammaId,
  api,
}: {
  chainId: IChainId
  llammaId: string
  api: LlamaApi | undefined | null
}) => {
  const { wallet } = useConnection()
  const userAddress = wallet?.account.address

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
  const { data: marketBandsBalances, isLoading: isMarketBandsBalancesLoading } = useMarketBandsBalances({
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
  })

  const isLoading =
    !api ||
    isLiquidationBandLoading ||
    isMarketBandsBalancesLoading ||
    isMarketOraclePriceBandLoading ||
    isMarketOraclePriceLoading ||
    isLoanExistsLoading ||
    isUserBandsBalancesLoading

  return {
    isLoading,
    chartData,
    userBandsBalances,
    oraclePrice,
  }
}
