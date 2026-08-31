import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { createApprovedEstimateGasHook } from '@evm-ui/lib/model/entities/gas-info'
import { StakeParams, StakeQuery, stakeValidationSuite, requireVault } from '../validation/supply.validation'
import { useStakeIsApproved } from './supply-stake-approved.query'

const { useQuery: useStakeApproveEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, stakeShares }: StakeParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.stakeApprove', { stakeShares }] as const,
  queryFn: async ({ marketId, stakeShares }: StakeQuery) =>
    await requireVault(marketId).vault.estimateGas.stakeApprove(stakeShares),
  category: 'llamalend.supply',
  validationSuite: stakeValidationSuite,
})

const { useQuery: useStakeEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, stakeShares }: StakeParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.stake', { stakeShares }] as const,
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
