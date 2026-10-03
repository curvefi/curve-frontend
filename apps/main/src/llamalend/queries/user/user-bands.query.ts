import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { UserMarketParams, UserMarketQuery } from '@evm-ui/queries/query-types'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { Range } from '@ui/features/queries/util'

const reverseBands = ([low, high]: number[]): Range<number> => [high, low]

/**
 * Query to get the user's band positions in a market.
 * Returns reversed bands [high, low] for UI display.
 */
export const { useQuery: useUserBands, queryKey: getUserBandsKey } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    ({ name: 'userBands', chainId, marketId, userAddress }) as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    reverseBands(await getUserPositionImplementation(marketId).userBands(userAddress)),
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})
