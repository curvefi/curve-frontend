import { createApprovedEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { queryFactory } from '@ui/features/queries/factory'
import { StakeParams, StakeQuery, stakeValidationSuite, requireVault } from '../validation/supply.validation'
import { useStakeIsApproved } from './supply-stake-approved.query'

const { useQuery: useStakeApproveEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, stakeShares }: StakeParams) =>
    ({ name: 'estimateGas.stakeApprove', chainId, marketId, userAddress, stakeShares }) as const,
  queryFn: async ({ marketId, stakeShares }: StakeQuery) =>
    await requireVault(marketId).vault.estimateGas.stakeApprove(stakeShares),
  category: 'llamalend.supply',
  validationSuite: stakeValidationSuite,
})

const { useQuery: useStakeEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, stakeShares }: StakeParams) =>
    ({ name: 'estimateGas.stake', chainId, marketId, userAddress, stakeShares }) as const,
  queryFn: async ({ marketId, stakeShares }: StakeQuery) =>
    await requireVault(marketId).vault.estimateGas.stake(stakeShares),
  category: 'llamalend.supply',
  validationSuite: stakeValidationSuite,
})

/** Estimates stake gas, using approval gas first when staking shares are not approved. */
export const useStakeEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useStakeIsApproved,
  useApproveEstimate: useStakeApproveEstimateGasQuery,
  useActionEstimate: useStakeEstimateGasQuery,
})
