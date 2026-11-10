import type { UserWithdrawParams, UserWithdrawQuery } from '@/dex/features/withdraw/types'
import { userWithdrawParamsValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import { createApprovedEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import { useWithdrawIsApproved } from './withdraw-approved.query'
import { getWithdrawImplementation } from './withdraw-query.helpers'

const { useQuery: useWithdrawApproveEstimate } = hydratedQueryFactory({
  queryKey: ({
    chainId,
    poolAddress,
    userAddress,
    isWrapped,
    mode,
    amounts,
    lpAmount,
    maxLpAmount,
    tokenIndex,
  }: UserWithdrawParams) =>
    ({
      name: 'estimateGas.withdrawApprove',
      chainId,
      poolAddress,
      userAddress,
      isWrapped,
      mode,
      amounts,
      lpAmount,
      maxLpAmount,
      tokenIndex,
    }) as const,
  queryFn: async ({ poolAddress, isWrapped, ...params }: UserWithdrawQuery) => {
    if (isWrapped) return 0 // No zap approval transaction to estimate.
    const [type, impl, args] = getWithdrawImplementation(poolAddress, params)
    switch (type) {
      case 'balanced':
        return await impl.estimateGas.withdrawApprove(...args)
      case 'imbalance':
        return await impl.estimateGas.withdrawImbalanceApprove(...args)
      case 'oneCoin':
        return await impl.estimateGas.withdrawOneCoinApprove(args[0])
    }
  },
  category: 'dex.pool',
  validationSuite: userWithdrawParamsValidationSuite,
})

const { useQuery: useWithdrawEstimate } = hydratedQueryFactory({
  queryKey: ({
    chainId,
    poolAddress,
    userAddress,
    isWrapped,
    mode,
    amounts,
    lpAmount,
    maxLpAmount,
    tokenIndex,
    slippage,
  }: UserWithdrawParams) =>
    ({
      name: 'estimateGas.withdraw',
      chainId,
      poolAddress,
      userAddress,
      isWrapped,
      mode,
      amounts,
      lpAmount,
      maxLpAmount,
      tokenIndex,
      slippage,
    }) as const,
  queryFn: async ({ poolAddress, isWrapped, slippage, ...params }: UserWithdrawQuery) => {
    const [type, impl, args] = getWithdrawImplementation(poolAddress, params)
    switch (type) {
      case 'balanced':
        return await impl.estimateGas[`withdraw${wrappedMethod(isWrapped)}`](...args, +slippage)
      case 'imbalance':
        return await impl.estimateGas[`withdrawImbalance${wrappedMethod(isWrapped)}`](...args, +slippage)
      case 'oneCoin':
        return await impl.estimateGas[`withdrawOneCoin${wrappedMethod(isWrapped)}`](...args, +slippage)
    }
  },
  category: 'dex.pool',
  validationSuite: userWithdrawParamsValidationSuite,
})

const useWithdrawEstimateGasQuery = createApprovedEstimateGasHook({
  useIsApproved: useWithdrawIsApproved,
  useApproveEstimate: useWithdrawApproveEstimate,
  useActionEstimate: useWithdrawEstimate,
})

export const useWithdrawEstimateGas = (params: UserWithdrawParams, enabled?: boolean) =>
  useWithdrawEstimateGasQuery(params, enabled)
