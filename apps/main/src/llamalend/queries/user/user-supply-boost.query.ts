import { zeroAddress } from 'viem'
import type { UserMarketParams, UserMarketQuery } from '@evm-ui/queries/query-types'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { requireVault } from '../validation/supply.validation'

export const { useQuery: useUserSupplyBoost } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    ({ name: 'userBoost', version: 1, chainId, marketId, userAddress }) as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery): Promise<Decimal> => {
    const { addresses, userPosition } = requireVault(marketId)
    return addresses.gauge === zeroAddress ? '0' : ((await userPosition.userBoost(userAddress)) as Decimal)
  },
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})
