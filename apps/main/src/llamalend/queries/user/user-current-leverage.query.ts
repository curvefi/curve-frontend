import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { leverageUserMarketValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import { queryFactory } from '@ui-kit/lib/model/query/factory'
import { rootKeys, UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { decimal } from '@ui-kit/utils/decimal'

/**
 * Query to get the user's current leverage value in a market.
 * Note this does not support leverage values for old mint markets (marketId < 6).
 */
export const { useQuery: useUserCurrentLeverage, queryKey: userCurrentLeverageQueryKey } = queryFactory({
  queryKey: ({ chainId, userAddress, marketId }: UserMarketParams) =>
    [...rootKeys.userMarket({ chainId, userAddress, marketId }), 'currentLeverage'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    decimal(await getUserPositionImplementation(marketId).currentLeverage(userAddress)) ?? '0', // return 0 when there is no loan, as usually done by llamalend.js
  category: 'llamalend.user',
  validationSuite: leverageUserMarketValidationSuite,
})
