import { zeroAddress } from 'viem'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { requireVault } from '../validation/supply.validation'

export const { useQuery: useUserSupplyBoost } = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'userBoost', 'v1'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery): Promise<Decimal> => {
    const { addresses, userPosition } = requireVault(marketId)
    return addresses.gauge === zeroAddress ? '0' : ((await userPosition.userBoost(userAddress)) as Decimal)
  },
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})
