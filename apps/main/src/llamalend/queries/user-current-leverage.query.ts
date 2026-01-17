import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory } from '@ui-kit/lib/model/query/factory'
import { rootKeys, UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { decimal } from '@ui-kit/utils/decimal'
import { getLlamaMarket } from '../llama.utils'

/**
 * Query to get the user's current leverage value in a market.
 * Note this is ONLY valid for lend market.
 */
export const { useQuery: useUserCurrentLeverage } = queryFactory({
  queryKey: ({ chainId, userAddress, marketId }: UserMarketParams) =>
    [...rootKeys.userMarket({ chainId, userAddress, marketId }), 'user-current-leverage'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getLlamaMarket(marketId)
    // TODO: get leverage value for new mint markets as well
    return market instanceof LendMarketTemplate ? (decimal(await market.currentLeverage(userAddress)) ?? null) : null
  },
  refetchInterval: '1m',
  validationSuite: userMarketValidationSuite,
})
