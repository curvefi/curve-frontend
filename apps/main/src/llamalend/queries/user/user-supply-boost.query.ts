import { queryFactory } from '@ui-kit/lib/model/query'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { UserMarketQuery, UserMarketParams } from '@ui-kit/lib/model/query/root-keys'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { requireVault } from '../validation/supply.validation'

const _fetchUserSupplyBoost = async ({ marketId, userAddress }: UserMarketQuery): Promise<number | null> => {
  const market = requireVault(marketId)
  const boost = await market.userBoost(userAddress)

  return boost ? +boost : null
}

export const { useQuery: useUserSupplyBoost, invalidate: invalidateUserSupplyBoost } = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'userBoost', 'v1'] as const,
  queryFn: _fetchUserSupplyBoost,
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})
