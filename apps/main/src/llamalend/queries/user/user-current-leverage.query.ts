import { getLlamaMarket } from '@/llamalend/llama.utils'
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
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getLlamaMarket(marketId)
    return decimal(await market.currentLeverage(userAddress)) ?? null
  },
  refetchInterval: '1m',
  validationSuite: leverageUserMarketValidationSuite,
})
