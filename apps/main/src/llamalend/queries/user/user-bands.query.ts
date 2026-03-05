import { reverseBands } from '@/llamalend/llama.utils'
import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'

/**
 * Query to get the user's band positions in a market.
 * Returns reversed bands [high, low] for UI display.
 */
export const { useQuery: useUserBands, invalidate: invalidateUserBands } = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'user-bands'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    reverseBands(await getUserPositionImplementation(marketId).userBands(userAddress)),
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})
