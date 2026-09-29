import { Address } from 'viem'
import { rootKeys, UserMarketParams, UserMarketQuery } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { claimableRewardsValidationSuite, requireGauge } from '../validation/supply.validation'

export type ClaimableReward = { token: Address; symbol: string; amount: Decimal }

export const { useQuery: useClaimableRewards, fetchQuery: fetchClaimableRewards } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) => ({
    name: 'claimableRewards',
    ...rootKeys.userMarket({ chainId, marketId, userAddress }),
  }),
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    (await requireGauge(marketId).vault.claimableRewards(userAddress)) as ClaimableReward[],
  category: 'llamalend.supply',
  validationSuite: claimableRewardsValidationSuite,
})

export const { useQuery: useClaimableCrv, fetchQuery: fetchClaimableCrv } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) => ({
    name: 'claimableCrv',
    ...rootKeys.userMarket({ chainId, marketId, userAddress }),
  }),
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    (await requireGauge(marketId).vault.claimableCrv(userAddress)) as Decimal,
  category: 'llamalend.supply',
  validationSuite: claimableRewardsValidationSuite,
})
