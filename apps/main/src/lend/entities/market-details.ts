import { ChainId } from '@/lend/types/lend.types'
import {
  useMarketTotalCollateral,
  useMarketCapAndAvailable,
  invalidateMarketCapAndAvailable,
  invalidateMarketTotalCollateral,
} from '@/llamalend/queries/market'
import { invalidateMarketRates, useMarketRates } from '@/llamalend/queries/market-rates.query'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'

const getLendMarket = (marketId: string) => requireLib('llamaApi').getLendMarket(marketId)

/**
 * The purpose of this query is to allow fetching market parameters on chain
 * in order to display the most current data when a wallet is connected.
 * The api data can have a few minutes delay.
 * */
export const { useQuery: useMarketOnChainRewards, invalidate: invalidateMarketOnChainRewards } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketOnchainRewards', 'v2'] as const,
  queryFn: async ({ marketId }: MarketQuery) => ({
    rewardsApr: await getLendMarket(marketId).vault.rewardsApr(false),
    crvRates: await getLendMarket(marketId).vault.crvApr(false),
  }),
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})

export const { useQuery: useMarketPricePerShare, invalidate: invalidateMarketPricePerShare } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketPricePerShare', 'v1'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLendMarket(marketId)
    return await market.vault.previewRedeem(1)
  },
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})

export const invalidateMarketDetails = ({ chainId, marketId }: { chainId: ChainId; marketId: string }) =>
  Promise.all([
    invalidateMarketOnChainRewards({ chainId, marketId }),
    invalidateMarketPricePerShare({ chainId, marketId }),
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
  const { data: marketOnChainRewards, isLoading: isMarketOnChainRewardsLoading } = useMarketOnChainRewards(queryParams)
  const { data: marketPricePerShare, isLoading: isMarketPricePerShareLoading } = useMarketPricePerShare(queryParams)
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
