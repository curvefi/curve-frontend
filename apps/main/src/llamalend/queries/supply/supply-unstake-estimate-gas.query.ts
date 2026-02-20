import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import { requireVault, UnstakeParams, UnstakeQuery, unstakeValidationSuite } from '../validation/supply.validation'

const { useQuery: useUnstakeEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, unstakeAmount }: UnstakeParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.unstake', { unstakeAmount }] as const,
  queryFn: async ({ marketId, unstakeAmount }: UnstakeQuery) =>
    await requireVault(marketId).vault.estimateGas.unstake(unstakeAmount),
  validationSuite: unstakeValidationSuite,
})

export const useUnstakeEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: UnstakeParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const {
    data: unstakeEstimate,
    isLoading: unstakeLoading,
    error: unstakeError,
  } = useUnstakeEstimateGasQuery(query, enabled)
  const {
    data,
    isLoading: conversionLoading,
    error: estimateError,
  } = useEstimateGas(networks, chainId, unstakeEstimate, enabled)

  return {
    data,
    isLoading: [unstakeLoading, conversionLoading].some(Boolean),
    error: [unstakeError, estimateError].find(Boolean) ?? null,
  }
}
