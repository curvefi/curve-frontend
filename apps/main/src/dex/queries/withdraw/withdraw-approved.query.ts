import type { UserWithdrawParams, UserWithdrawQuery } from '@/dex/features/withdraw/types'
import { userWithdrawParamsValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import { getPool } from '@/dex/pool.utils'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'

export const { useQuery: useWithdrawIsApproved, fetchQuery: fetchWithdrawIsApproved } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, userAddress, isWrapped, amounts, maxLpAmount, ...params }: UserWithdrawParams) =>
    ({
      name: 'withdrawIsApproved',
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
    if (isWrapped) return true // Direct pool withdrawal needs no zap allowance.
    const pool = getPool(poolAddress)
    switch (params.mode) {
      case 'balanced':
        return await pool.withdrawIsApproved(params.lpAmount)
      case 'unbalanced':
        return await pool.withdrawImbalanceIsApproved(amounts)
      case 'one-coin':
        return await pool.withdrawOneCoinIsApproved(params.lpAmount)
    }
  },
  category: 'dex.pool',
  validationSuite: userWithdrawParamsValidationSuite,
})
