import { USE_API } from '@/lend/shared/config'
import { ChainId } from '@/lend/types/lend.types'
import { invalidateMarketRates, useMarketRates } from '@/llamalend/queries/market-rates'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { MarketQuery, MarketParams } from '@ui-kit/lib/model/query/root-keys'

const getLendMarket = (marketId: string) => requireLib('llamaApi').getLendMarket(marketId)

export const { useQuery: useMarketCapAndAvailable, invalidate: invalidateMarketCapAndAvailable } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketCapAndAvailable', 'v1'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLendMarket(marketId)
    const capAndAvailable = await market.stats.capAndAvailable(false, USE_API)
    return {
      cap: Number(capAndAvailable.cap),
      available: Number(capAndAvailable.available),
    }
  },
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})

export const { useQuery: useMarketMaxLeverage } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketMaxLeverage', 'v1'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLendMarket(marketId)
    const maxLeverage = market.leverage.hasLeverage() ? await market.leverage.maxLeverage(market?.minBands) : null
    return { maxLeverage }
  },
  validationSuite: marketIdValidationSuite,
})

export const { useQuery: useMarketCollateralAmounts, invalidate: invalidateMarketCollateralAmounts } = queryFactory({
  queryKey: (params: MarketParams) => [...rootKeys.market(params), 'marketCollateralAmounts', 'v1'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLendMarket(marketId)
    const ammBalance = await market.stats.ammBalances(false, USE_API)
    return {
      collateralAmount: Number(ammBalance.collateral),
      borrowedAmount: Number(ammBalance.borrowed),
    }
  },
  refetchInterval: '1m',
  validationSuite: marketIdValidationSuite,
})

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

export const invalidateMarketDetails = ({ chainId, marketId }: { chainId: ChainId; marketId: string }) => {
  invalidateMarketCapAndAvailable({ chainId, marketId })
  invalidateMarketCollateralAmounts({ chainId, marketId })
  invalidateMarketOnChainRewards({ chainId, marketId })
  invalidateMarketPricePerShare({ chainId, marketId })
  invalidateMarketRates({ chainId, marketId })
}

export const useMarketDetails = (params: MarketParams, options?: { enabled?: boolean }) => {
  const queryParams = { ...params, ...options }

  const { data: marketCapAndAvailable, isLoading: isMarketCapAndAvailableLoading } =
    useMarketCapAndAvailable(queryParams)
  const { data: marketMaxLeverage, isLoading: isMarketMaxLeverageLoading } = useMarketMaxLeverage(queryParams)
  const { data: marketCollateralAmounts, isLoading: isMarketCollateralAmountsLoading } =
    useMarketCollateralAmounts(queryParams)
  const { data: marketOnChainRewards, isLoading: isMarketOnChainRewardsLoading } = useMarketOnChainRewards(queryParams)
  const { data: marketPricePerShare, isLoading: isMarketPricePerShareLoading } = useMarketPricePerShare(queryParams)
  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates({
    chainId: params.chainId as ChainId,
    marketId: params.marketId,
  })

  return {
    data: {
      ...(marketCapAndAvailable ?? undefined),
      ...(marketMaxLeverage ?? undefined),
      ...(marketCollateralAmounts ?? undefined),
      ...(marketOnChainRewards ?? undefined),
      ...(marketRates ?? undefined),
      pricePerShare: marketPricePerShare,
    },
    isLoading: {
      marketCapAndAvailable: isMarketCapAndAvailableLoading,
      marketMaxLeverage: isMarketMaxLeverageLoading,
      marketCollateralAmounts: isMarketCollateralAmountsLoading,
      marketOnChainRewards: isMarketOnChainRewardsLoading,
      marketRates: isMarketRatesLoading,
      marketPricePerShare: isMarketPricePerShareLoading,
    },
  }
}
