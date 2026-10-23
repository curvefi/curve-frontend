import type { UserWithdrawParams, UserWithdrawQuery } from '@/dex/features/withdraw/types'
import { userWithdrawParamsValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { getWithdrawImplementation } from './withdraw-query.helpers'

export const { useQuery: useWithdrawIsApproved, fetchQuery: fetchWithdrawIsApproved } = queryFactory({
  queryKey: ({
    chainId,
    poolAddress,
    userAddress,
    isWrapped,
    isBalanced,
    amounts,
    lpAmount,
    maxLpAmount,
    maxWithdrawIndex,
  }: UserWithdrawParams) =>
    ({
      name: 'withdrawIsApproved',
      chainId,
      poolAddress,
      userAddress,
      isWrapped,
      isBalanced,
      amounts,
      lpAmount,
      maxLpAmount,
      maxWithdrawIndex,
    }) as const,
  queryFn: async ({ poolAddress, isWrapped, ...params }: UserWithdrawQuery) => {
    if (isWrapped) return true // Direct pool withdrawal needs no zap allowance.
    const [type, impl, args] = getWithdrawImplementation(poolAddress, params)
    switch (type) {
      case 'balanced':
        return await impl.withdrawIsApproved(...args)
      case 'imbalance':
        return await impl.withdrawImbalanceIsApproved(...args)
      case 'oneCoin':
        return await impl.withdrawOneCoinIsApproved(args[0])
    }
  },
  category: 'dex.pool',
  validationSuite: userWithdrawParamsValidationSuite,
})
