import { queryFactory } from '@ui-kit/lib/model/query/factory'
import { rootKeys, UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { getLlamaMarket } from '../llama.utils'

export const { useQuery: useUserCurrentLeverage } = queryFactory({
  queryKey: ({ chainId, userAddress, marketId }: UserMarketParams) =>
    [...rootKeys.userMarket({ chainId, userAddress, marketId }), 'user-current-leverage'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getLlamaMarket(marketId)
    return await market.currentLeverage(userAddress)
  },
  refetchInterval: '1m',
  validationSuite: userMarketValidationSuite,
})
