import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { StakeParams, StakeQuery, stakeValidationSuite, requireVault } from '../validation/supply.validation'

export const { useQuery: useStakeIsApproved, fetchQuery: fetchStakeIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, stakeShares }: StakeParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'stakeIsApproved', { stakeShares }] as const,
  queryFn: async ({ marketId, stakeShares }: StakeQuery) =>
    await requireVault(marketId).vault.stakeIsApproved(stakeShares),
  category: 'llamalend.supply',
  validationSuite: stakeValidationSuite,
})
