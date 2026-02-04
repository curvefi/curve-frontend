import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { StakeParams, StakeQuery, stakeValidationSuite, requireVault } from '../validation/supply.validation'

export const { useQuery: useStakeIsApproved, fetchQuery: fetchStakeIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, stakeAmount }: StakeParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'stakeIsApproved', { stakeAmount }] as const,
  queryFn: async ({ marketId, stakeAmount }: StakeQuery) =>
    await requireVault(marketId).vault.stakeIsApproved(stakeAmount),
  validationSuite: stakeValidationSuite,
})
