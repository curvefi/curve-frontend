import { queryFactory } from '@ui/features/queries/factory'
import { StakeParams, StakeQuery, stakeValidationSuite, requireVault } from '../validation/supply.validation'

export const { useQuery: useStakeIsApproved, fetchQuery: fetchStakeIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, stakeShares }: StakeParams) => ({
    name: 'stakeIsApproved',
    chainId,
    marketId,
    userAddress,
    stakeShares,
  }),
  queryFn: async ({ marketId, stakeShares }: StakeQuery) =>
    await requireVault(marketId).vault.stakeIsApproved(stakeShares),
  category: 'llamalend.supply',
  validationSuite: stakeValidationSuite,
})
