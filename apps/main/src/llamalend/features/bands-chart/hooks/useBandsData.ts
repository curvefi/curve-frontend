import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import {
  getMissingOracleContextBandNumbers,
  mergeMarketBandsWithOracleContext,
} from '@/llamalend/features/bands-chart/hooks/bands-data.utils'
import { useProcessedBandsData } from '@/llamalend/features/bands-chart/hooks/useProcessedBandsData'
import { useMarketBandsBalances, useUserBandsBalances, useMarketOracleContextBands } from '@/llamalend/queries/bands'
import { useMarketLiquidationBand, useMarketOraclePriceBand, useMarketOraclePrice } from '@/llamalend/queries/market'
import { useLoanExists } from '@/llamalend/queries/user'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LlamaApi } from '@ui-kit/features/connect-wallet'
import { useCurve } from '@ui-kit/features/connect-wallet'

export const useBandsData = ({
  chainId,
  marketId,
  api,
}: {
  chainId: IChainId
  marketId: string
  api: LlamaApi | undefined | null
}) => {
  const { isHydrated } = useCurve()
  const { address: userAddress } = useConnection()
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists({
    chainId,
    marketId,
    userAddress,
  })
  const { data: liquidationBand, isLoading: isLiquidationBandLoading } = useMarketLiquidationBand({
    chainId,
    marketId,
  })
  const { data: userBandsBalances, isLoading: isUserBandsBalancesLoading } = useUserBandsBalances({
    chainId,
    marketId,
    userAddress,
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
    error: marketBandsBalancesError,
  } = useMarketBandsBalances({
    chainId,
    marketId,
    liquidationBand,
  })
  const missingOracleContextBandNumbers = useMemo(
    () => getMissingOracleContextBandNumbers(marketBandsBalances, oraclePriceBand),
    [marketBandsBalances, oraclePriceBand],
  )
  const missingBandsKey = useMemo(() => missingOracleContextBandNumbers.join(','), [missingOracleContextBandNumbers])
  const shouldFetchOracleContextBands = missingOracleContextBandNumbers.length > 0
  const {
    data: fetchedOracleContextBands,
    isLoading: isOracleContextBandsLoading,
    error: oracleContextBandsError,
  } = useMarketOracleContextBands(
    {
      chainId,
      marketId,
      oraclePriceBand,
      liquidationBand,
      missingBandsKey,
    },
    shouldFetchOracleContextBands,
  )
  const oracleContextBands = useMemo(
    () => (shouldFetchOracleContextBands ? fetchedOracleContextBands : []),
    [fetchedOracleContextBands, shouldFetchOracleContextBands],
  )
  const { data: oraclePrice, isLoading: isMarketOraclePriceLoading } = useMarketOraclePrice({
    chainId,
    marketId,
  })

  const marketBandsBalancesWithOracleContext = useMemo(
    () => mergeMarketBandsWithOracleContext(marketBandsBalances, oracleContextBands),
    [marketBandsBalances, oracleContextBands],
  )

  const chartData = useProcessedBandsData({
    marketBandsBalances: marketBandsBalancesWithOracleContext,
    userBandsBalances,
    oraclePriceBand,
  })

  const isLoading =
    !isHydrated ||
    !api ||
    isLiquidationBandLoading ||
    isMarketBandsBalancesLoading ||
    isOracleContextBandsLoading ||
    isMarketOraclePriceBandLoading ||
    isMarketOraclePriceLoading ||
    isLoanExistsLoading ||
    isUserBandsBalancesLoading

  return {
    isLoading,
    error: marketBandsBalancesError ?? oracleContextBandsError,
    chartData,
    userBandsBalances,
    oraclePrice,
  }
}
