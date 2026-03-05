import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { leverageUserMarketValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import { queryFactory } from '@ui-kit/lib/model/query/factory'
import { rootKeys, UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { decimal } from '@ui-kit/utils/decimal'

/**
 * Query to get the user's current leverage value in a market.
 * Note this does not support leverage values for old mint markets (marketId < 6).
 */
export const { useQuery: useUserCurrentLeverage, invalidate: invalidateUserCurrentLeverage } = queryFactory({
  queryKey: ({ chainId, userAddress, marketId }: UserMarketParams) =>
    [...rootKeys.userMarket({ chainId, userAddress, marketId }), 'user-current-leverage'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    decimal(await getUserPositionImplementation(marketId).currentLeverage(userAddress)) ?? null,
  category: 'llamalend.user',
  validationSuite: leverageUserMarketValidationSuite,
})
