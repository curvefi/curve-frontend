import { useConnection } from 'wagmi'
import { isPositionLeveraged } from '@/llamalend/llama.utils'
import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { leverageUserMarketValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import { queryFactory } from '@ui-kit/lib/model/query/factory'
import { type MarketParams, rootKeys, UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { mapQuery } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils/decimal'

/**
 * Query to get the user's current leverage value in a market.
 * Note this does not support leverage values for old mint markets (marketId < 6).
 */
export const { useQuery: useUserCurrentLeverage, queryKey: userCurrentLeverageQueryKey } = queryFactory({
  queryKey: ({ chainId, userAddress, marketId }: UserMarketParams) =>
    [...rootKeys.userMarket({ chainId, userAddress, marketId }), 'currentLeverage'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    decimal(await getUserPositionImplementation(marketId).currentLeverage(userAddress))!,
  category: 'llamalend.user',
  validationSuite: leverageUserMarketValidationSuite,
})

export function useIsLeveragedPosition(params: MarketParams) {
  const { address: userAddress } = useConnection()
  const currentLeverage = useUserCurrentLeverage({ ...params, userAddress })
  return mapQuery(currentLeverage, (data) => isPositionLeveraged(data))
}
