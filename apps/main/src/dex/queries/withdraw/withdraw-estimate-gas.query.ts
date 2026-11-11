import type { UserWithdrawParams, UserWithdrawQuery } from '@/dex/features/withdraw/types'
import { userWithdrawParamsValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import { createApprovedEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import { useWithdrawIsApproved } from './withdraw-approved.query'

const { useQuery: useWithdrawApproveEstimate } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, userAddress, isWrapped, amounts, maxLpAmount, ...params }: UserWithdrawParams) =>
    ({
      name: 'estimateGas.withdrawApprove',
      chainId,
      poolAddress,
      userAddress,
      isWrapped,
      mode: params.mode,
      amounts,
      maxLpAmount,
      ...('lpAmount' in params && { lpAmount: params.lpAmount }),
      ...('tokenIndex' in params && { tokenIndex: params.tokenIndex }),
    }) as const,
  queryFn: async ({ poolAddress, isWrapped, amounts, ...params }: UserWithdrawQuery) => {
    if (isWrapped) return 0 // No zap approval transaction to estimate.
    const pool = requireLib('curveApi').getPool(poolAddress)
    switch (params.mode) {
      case 'balanced':
        return await pool.estimateGas.withdrawApprove(params.lpAmount)
      case 'unbalanced':
        return await pool.estimateGas.withdrawImbalanceApprove(amounts)
      case 'one-coin':
        return await pool.estimateGas.withdrawOneCoinApprove(params.lpAmount)
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
    amounts,
    maxLpAmount,
    slippage,
    ...params
  }: UserWithdrawParams) =>
    ({
      name: 'estimateGas.withdraw',
      chainId,
      poolAddress,
      userAddress,
      isWrapped,
      mode: params.mode,
      amounts,
      maxLpAmount,
      slippage,
      ...('lpAmount' in params && { lpAmount: params.lpAmount }),
      ...('tokenIndex' in params && { tokenIndex: params.tokenIndex }),
    }) as const,
  queryFn: async ({ poolAddress, isWrapped, slippage, amounts, ...params }: UserWithdrawQuery) => {
    const pool = requireLib('curveApi').getPool(poolAddress)
    switch (params.mode) {
      case 'balanced':
        return await pool.estimateGas[`withdraw${wrappedMethod(isWrapped)}`](params.lpAmount, +slippage)
      case 'unbalanced':
        return await pool.estimateGas[`withdrawImbalance${wrappedMethod(isWrapped)}`](amounts, +slippage)
      case 'one-coin': {
        const { lpAmount, tokenIndex } = params
        return await pool.estimateGas[`withdrawOneCoin${wrappedMethod(isWrapped)}`](lpAmount, tokenIndex, +slippage)
      }
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
