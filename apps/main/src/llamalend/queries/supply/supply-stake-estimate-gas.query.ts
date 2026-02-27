import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import { StakeParams, StakeQuery, stakeValidationSuite, requireVault } from '../validation/supply.validation'
import { useStakeIsApproved } from './supply-stake-approved.query'

const { useQuery: useStakeApproveEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, stakeAmount }: StakeParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.stakeApprove', { stakeAmount }] as const,
  queryFn: async ({ marketId, stakeAmount }: StakeQuery) =>
    await requireVault(marketId).vault.estimateGas.stakeApprove(stakeAmount),
  category: 'user',
  validationSuite: stakeValidationSuite,
})

const { useQuery: useStakeEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, stakeAmount }: StakeParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.stake', { stakeAmount }] as const,
  queryFn: async ({ marketId, stakeAmount }: StakeQuery) =>
    await requireVault(marketId).vault.estimateGas.stake(stakeAmount),
  category: 'user',
  validationSuite: stakeValidationSuite,
})

export const useStakeEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: StakeParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const { data: isApproved, isLoading: isApprovedLoading, error: isApprovedError } = useStakeIsApproved(query, enabled)
  const {
    data: approveEstimate,
    isLoading: approveLoading,
    error: approveError,
  } = useStakeApproveEstimateGasQuery(query, enabled && !isApproved)
  const {
    data: stakeEstimate,
    isLoading: stakeLoading,
    error: stakeError,
  } = useStakeEstimateGasQuery(query, enabled && !!isApproved)
  const {
    data,
    isLoading: conversionLoading,
    error: estimateError,
  } = useEstimateGas(networks, chainId, isApproved ? stakeEstimate : approveEstimate, enabled)

  return {
    data,
    isLoading: [isApprovedLoading, approveLoading, stakeLoading, conversionLoading].some(Boolean),
    error: [isApprovedError, approveError, stakeError, estimateError].find(Boolean) ?? null,
  }
}
