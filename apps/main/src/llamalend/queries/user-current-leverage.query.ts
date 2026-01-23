import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory } from '@ui-kit/lib/model/query/factory'
import { rootKeys, UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { decimal } from '@ui-kit/utils/decimal'
import { getLlamaMarket, hasLeverage, hasSupportedLeverage, hasV1Leverage, hasV2Leverage } from '../llama.utils'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets/MintMarketTemplate'

/**
 * Query to get the user's current leverage value in a market.
 * Note this does not support leverage values for old mint markets (marketId < 6).
 */
export const { useQuery: useUserCurrentLeverage } = queryFactory({
  queryKey: ({ chainId, userAddress, marketId }: UserMarketParams) =>
    [...rootKeys.userMarket({ chainId, userAddress, marketId }), 'user-current-leverage'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getLlamaMarket(marketId)
    return hasSupportedLeverage(market) ? (decimal(await market.currentLeverage(userAddress)) ?? null) : null
  },
  refetchInterval: '1m',
  validationSuite: userMarketValidationSuite,
})
