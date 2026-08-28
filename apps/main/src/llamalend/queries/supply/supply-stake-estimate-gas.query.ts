import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { combineQueries, pickQuery } from '@evm-ui/lib'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { useEstimateGas } from '@evm-ui/lib/model/entities/gas-info'
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

export const useStakeEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: StakeParams<ChainId>,
  enabled?: boolean,
) => {
  const isApproved = useStakeIsApproved(query, enabled)
  const approveEstimate = useStakeApproveEstimateGasQuery(query, enabled && !isApproved.data)
  const stakeEstimate = useStakeEstimateGasQuery(query, enabled && !!isApproved.data)
  const estimate = pickQuery([stakeEstimate, approveEstimate], ([stake, approve]) =>
    isApproved.data ? stake : approve,
  )
  const gas = useEstimateGas(networks, query.chainId, estimate, enabled)

  return combineQueries([isApproved, gas], (_, gas) => gas)
}
