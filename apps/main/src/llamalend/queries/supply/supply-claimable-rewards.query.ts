import { Address } from 'viem'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys, UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model'
import { claimableRewardsValidationSuite, requireVault, requireGauge } from '../validation/supply.validation'

export type ClaimableReward = { token: Address; symbol: string; amount: Decimal }

export const { useQuery: useClaimableRewards, fetchQuery: fetchClaimableRewards } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'claimableRewards'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    (await requireGauge(marketId).vault.claimableRewards(userAddress)) as ClaimableReward[],
  validationSuite: claimableRewardsValidationSuite,
})

export const { useQuery: useClaimableCrv, fetchQuery: fetchClaimableCrv } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'claimableCrv'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) =>
    (await requireVault(marketId).vault.claimableCrv(userAddress)) as Decimal,
  validationSuite: claimableRewardsValidationSuite,
})
