import { useEstimateGas } from '@/llamalend/hooks/useEstimateGas'
import { getLlamaMarket, hasVault } from '@/llamalend/llama.utils'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { DepositParams, DepositQuery, depositValidationSuite } from '../validation/supply.validation'
import { useDepositIsApproved } from './supply-deposit-approved.query'

const { useQuery: useDepositApproveEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, depositAmount }: DepositParams) =>
    [...rootKeys.market({ chainId, marketId }), 'estimateGas.depositApprove', { depositAmount }] as const,
  queryFn: async ({ marketId, depositAmount }: DepositQuery) => {
    const market = getLlamaMarket(marketId)
    if (!hasVault(market)) throw new Error('Market does not have a vault')
    return await market.vault.estimateGas.depositApprove(depositAmount)
  },
  staleTime: '1m',
  validationSuite: depositValidationSuite,
})

const { useQuery: useDepositEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, marketId, depositAmount }: DepositParams) =>
    [...rootKeys.market({ chainId, marketId }), 'estimateGas.deposit', { depositAmount }] as const,
  queryFn: async ({ marketId, depositAmount }: DepositQuery) => {
    const market = getLlamaMarket(marketId)
    if (!hasVault(market)) throw new Error('Market does not have a vault')
    return await market.vault.estimateGas.deposit(depositAmount)
  },
  staleTime: '1m',
  validationSuite: depositValidationSuite,
})

export const useDepositEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: DepositParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId, marketId, depositAmount } = query
  const { data: isApproved } = useDepositIsApproved({ chainId, marketId, depositAmount }, enabled)

  const { data: approveEstimate, isLoading: approveLoading } = useDepositApproveEstimateGasQuery(
    query,
    enabled && isApproved === false,
  )
  const { data: depositEstimate, isLoading: depositLoading } = useDepositEstimateGasQuery(
    query,
    enabled && isApproved === true,
  )

  const estimate = isApproved ? depositEstimate : approveEstimate
  const isEstimateLoading = isApproved === undefined || (isApproved ? depositLoading : approveLoading)

  const {
    data,
    isLoading: conversionLoading,
    error: estimateError,
  } = useEstimateGas<ChainId>(networks, chainId, estimate, enabled && !isEstimateLoading)

  return { data, isApproved, isLoading: isEstimateLoading || conversionLoading, error: estimateError }
}
