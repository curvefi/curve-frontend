import { useEstimateGas } from '@/llamalend/hooks/useEstimateGas'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { DepositParams, DepositQuery, depositValidationSuite, requireVault } from '../validation/supply.validation'
import { useDepositIsApproved } from './supply-deposit-approved.query'

const { useQuery: useDepositApproveEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, depositAmount }: DepositParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'estimateGas.depositApprove',
      { depositAmount },
    ] as const,
  queryFn: async ({ marketId, depositAmount }: DepositQuery) =>
    await requireVault(marketId).vault.estimateGas.depositApprove(depositAmount),
  validationSuite: depositValidationSuite,
})

const { useQuery: useDepositEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, depositAmount }: DepositParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'estimateGas.deposit', { depositAmount }] as const,
  queryFn: async ({ marketId, depositAmount }: DepositQuery) =>
    await requireVault(marketId).vault.estimateGas.deposit(depositAmount),
  validationSuite: depositValidationSuite,
})

export const useDepositEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: DepositParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const {
    data: isApproved,
    isLoading: isApprovedLoading,
    error: isApprovedError,
  } = useDepositIsApproved(query, enabled)
  const {
    data: approveEstimate,
    isLoading: approveLoading,
    error: approveError,
  } = useDepositApproveEstimateGasQuery(query, enabled && !isApproved)
  const {
    data: depositEstimate,
    isLoading: depositLoading,
    error: depositError,
  } = useDepositEstimateGasQuery(query, enabled && !!isApproved)
  const {
    data,
    isLoading: conversionLoading,
    error: estimateError,
  } = useEstimateGas<ChainId>(networks, chainId, isApproved ? depositEstimate : approveEstimate, enabled)

  return {
    data,
    isLoading: [isApprovedLoading, approveLoading, depositLoading, conversionLoading].some(Boolean),
    error: [isApprovedError, approveError, depositError, estimateError].find(Boolean),
  }
}
