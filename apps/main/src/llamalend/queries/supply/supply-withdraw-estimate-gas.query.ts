import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import { requireVault, WithdrawParams, WithdrawQuery, withdrawValidationSuite } from '../validation/supply.validation'

const { useQuery: useWithdrawEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, withdrawAmount }: WithdrawParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.withdraw', { withdrawAmount }] as const,
  queryFn: async ({ marketId, withdrawAmount }: WithdrawQuery) =>
    await requireVault(marketId).vault.estimateGas.withdraw(withdrawAmount),
  category: 'user',
  validationSuite: withdrawValidationSuite,
})

export const useWithdrawEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: WithdrawParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const {
    data: withdrawEstimate,
    isLoading: withdrawLoading,
    error: withdrawError,
  } = useWithdrawEstimateGasQuery(query, enabled)
  const {
    data,
    isLoading: conversionLoading,
    error: estimateError,
  } = useEstimateGas(networks, chainId, withdrawEstimate, enabled)

  return {
    data,
    isLoading: [withdrawLoading, conversionLoading].some(Boolean),
    error: [withdrawError, estimateError].find(Boolean) ?? null,
  }
}
