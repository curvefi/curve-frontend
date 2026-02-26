import { ChainId } from '@/lend/types/lend.types'
import {
  useMarketTotalCollateral,
  useMarketCapAndAvailable,
  useMarketVaultOnChainRewards,
  useMarketVaultPricePerShare,
  invalidateMarketCapAndAvailable,
  invalidateMarketTotalCollateral,
  invalidateMarketVaultOnChainRewards,
  invalidateMarketVaultPricePerShare,
} from '@/llamalend/queries/market'
import { invalidateMarketRates, useMarketRates } from '@/llamalend/queries/market-rates.query'
import type { MarketParams } from '@ui-kit/lib/model/query/root-keys'

export const invalidateMarketDetails = ({ chainId, marketId }: { chainId: ChainId; marketId: string }) =>
  Promise.all([
    invalidateMarketVaultOnChainRewards({ chainId, marketId }),
    invalidateMarketVaultPricePerShare({ chainId, marketId }),
    invalidateMarketRates({ chainId, marketId }),
    invalidateMarketTotalCollateral({ chainId, marketId }),
    invalidateMarketCapAndAvailable({ chainId, marketId }),
  ])

export const useMarketDetails = (params: MarketParams, options?: { enabled?: boolean }) => {
  const queryParams = { ...params, ...options }

  const { data: marketTotalCollateral, isLoading: isMarketTotalCollateralLoading } =
    useMarketTotalCollateral(queryParams)
  const { data: marketCapAndAvailable, isLoading: isMarketCapAndAvailableLoading } =
    useMarketCapAndAvailable(queryParams)
  const { data: marketOnChainRewards, isLoading: isMarketOnChainRewardsLoading } =
    useMarketVaultOnChainRewards(queryParams)
  const { data: marketPricePerShare, isLoading: isMarketPricePerShareLoading } =
    useMarketVaultPricePerShare(queryParams)
  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates({
    chainId: params.chainId as ChainId,
    marketId: params.marketId,
  })

  return {
    data: {
      ...(marketCapAndAvailable ?? undefined),
      ...(marketTotalCollateral ?? undefined),
      ...(marketOnChainRewards ?? undefined),
      ...(marketRates ?? undefined),
      pricePerShare: marketPricePerShare,
    },
    isLoading: {
      marketCollateralAmounts: isMarketTotalCollateralLoading,
      marketCapAndAvailable: isMarketCapAndAvailableLoading,
      marketOnChainRewards: isMarketOnChainRewardsLoading,
      marketRates: isMarketRatesLoading,
      marketPricePerShare: isMarketPricePerShareLoading,
    },
  }
}
