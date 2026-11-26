import { userSwapParamsValidationSuite } from '@/dex/features/swap/swap.validation'
import type { SwapQuery, UserSwapParams } from '@/dex/features/swap/types'
import { getPool } from '@/dex/pool.utils'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import { createApprovedEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import { useSwapIsApproved } from './swap-approved.query'

const { useQuery: useSwapApproveEstimate } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, userAddress, isWrapped, fromIndex, inputAmount }: UserSwapParams) =>
    ({
      name: 'estimateGas.swapApprove',
      chainId,
      poolAddress,
      userAddress,
      isWrapped,
      fromIndex,
      inputAmount,
    }) as const,
  queryFn: async ({ poolAddress, isWrapped, fromIndex, inputAmount }: SwapQuery) =>
    await getPool(poolAddress).estimateGas[`swap${wrappedMethod(isWrapped)}Approve`](fromIndex, inputAmount),
  category: 'dex.swap',
  validationSuite: userSwapParamsValidationSuite,
})

const { useQuery: useSwapEstimate } = hydratedQueryFactory({
  queryKey: ({
    chainId,
    poolAddress,
    userAddress,
    isWrapped,
    fromIndex,
    toIndex,
    inputAmount,
    slippage,
  }: UserSwapParams) =>
    ({
      name: 'estimateGas.swap',
      chainId,
      poolAddress,
      userAddress,
      isWrapped,
      fromIndex,
      toIndex,
      inputAmount,
      slippage,
    }) as const,
  queryFn: async ({ poolAddress, isWrapped, fromIndex, toIndex, inputAmount, slippage }: SwapQuery) =>
    await getPool(poolAddress).estimateGas[`swap${wrappedMethod(isWrapped)}`](
      fromIndex,
      toIndex,
      inputAmount,
      +slippage,
    ),
  category: 'dex.swap',
  validationSuite: userSwapParamsValidationSuite,
})

export const useSwapEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useSwapIsApproved,
  useApproveEstimate: useSwapApproveEstimate,
  useActionEstimate: useSwapEstimate,
})
