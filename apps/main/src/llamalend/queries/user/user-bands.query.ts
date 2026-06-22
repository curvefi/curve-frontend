import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import type { Range } from '@ui-kit/types/util'

const reverseBands = ([low, high]: number[]): Range<number> => [high, low]

/**
 * Query to get the user's band positions in a market.
 * Returns reversed bands [high, low] for UI display.
 */
export const { useQuery: useUserBands, queryKey: getUserBandsKey } = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'userBands'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    reverseBands(await getUserPositionImplementation(marketId).userBands(userAddress)),
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})
