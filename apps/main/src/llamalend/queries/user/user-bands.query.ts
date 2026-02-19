import { getLlamaMarket, reverseBands } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'

/**
 * Query to get the user's band positions in a market.
 * Returns reversed bands [high, low] for UI display.
 */
export const { useQuery: useUserBands, invalidate: invalidateUserBands } = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'user-bands'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getLlamaMarket(marketId)
    const bands = market instanceof LendMarketTemplate ? await market.userBands() : await market.userBands(userAddress)
    return reverseBands(bands)
  },
  refetchInterval: '1m',
  validationSuite: userMarketValidationSuite,
})
