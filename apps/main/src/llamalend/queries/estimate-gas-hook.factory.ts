import { useEstimateGas } from '@/llamalend/hooks/useEstimateGas'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'

type EstimateValue = number | number[] | null | undefined

type QueryResult<T, E = unknown> = {
  data: T | undefined
  isLoading: boolean
  error: E
}

type WithOptionalChainId = {
  chainId?: IChainId | null | undefined
}

type ApprovedEstimateGasHookConfig<Query, Estimate extends EstimateValue> = {
  useIsApproved: (query: Query, enabled?: boolean) => QueryResult<boolean>
  useApproveEstimate: (query: Query, enabled?: boolean) => QueryResult<Estimate>
  useActionEstimate: (query: Query, enabled?: boolean) => QueryResult<Estimate>
}

export const createApprovedEstimateGasHook =
  <Query extends WithOptionalChainId, Estimate extends EstimateValue>({
    useIsApproved,
    useApproveEstimate,
    useActionEstimate,
  }: ApprovedEstimateGasHookConfig<Query, Estimate>) =>
  <ChainId extends IChainId>(
    networks: NetworkDict<ChainId>,
    query: Query & { chainId?: ChainId | null | undefined },
    enabled?: boolean,
  ) => {
    const { data: isApproved, isLoading: isApprovedLoading, error: isApprovedError } = useIsApproved(query, enabled)
    const {
      data: approveEstimate,
      isLoading: approveLoading,
      error: approveError,
    } = useApproveEstimate(query, enabled && isApproved === false)
    const {
      data: actionEstimate,
      isLoading: actionLoading,
      error: actionError,
    } = useActionEstimate(query, enabled && isApproved === true)
    const chainId = query.chainId as ChainId | null | undefined
    const {
      data,
      isLoading: conversionLoading,
      error: estimateError,
    } = useEstimateGas<ChainId>(networks, chainId, isApproved ? actionEstimate : approveEstimate, enabled)

    return {
      data,
      isLoading: [isApprovedLoading, approveLoading, actionLoading, conversionLoading].some(Boolean),
      error: [isApprovedError, approveError, actionError, estimateError].find(Boolean) as Error | null | undefined,
    }
  }
