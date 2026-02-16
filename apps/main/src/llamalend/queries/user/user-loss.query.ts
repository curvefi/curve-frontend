import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'

/**
 * Query to get the user's collateral loss data in a market.
 */
export const { useQuery: useUserLoss, invalidate: invalidateUserLoss } = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'user-loss'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getLlamaMarket(marketId)
    return market instanceof LendMarketTemplate ? await market.userLoss() : await market.userLoss(userAddress)
  },
  refetchInterval: '1m',
  validationSuite: userMarketValidationSuite,
})
