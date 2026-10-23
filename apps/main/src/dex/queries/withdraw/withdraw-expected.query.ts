import type { WithdrawParams, WithdrawQuery } from '@/dex/features/withdraw/types'
import { getMaximumWithdrawBurn } from '@/dex/features/withdraw/withdraw.utils'
import { withdrawQueryValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery, q } from '@ui/features/queries/util'
import { getWithdrawImplementation } from './withdraw-query.helpers'

export const { useQuery: useWithdrawExpected, invalidate: invalidateWithdrawExpected } = queryFactory({
  queryKey: ({
    chainId,
    poolAddress,
    isWrapped,
    isBalanced,
    amounts,
    lpAmount,
    maxLpAmount,
    maxWithdrawIndex,
  }: WithdrawParams) =>
    ({
      name: 'withdrawExpected',
      chainId,
      poolAddress,
      isWrapped,
      isBalanced,
      amounts,
      lpAmount,
      maxLpAmount,
      maxWithdrawIndex,
    }) as const,
  queryFn: async ({ poolAddress, isWrapped, ...params }: WithdrawQuery) => {
    const [type, impl, args] = getWithdrawImplementation(poolAddress, params)
    switch (type) {
      case 'balanced':
      case 'oneCoin':
        return params.lpAmount
      case 'imbalance':
        return (await impl[`withdrawImbalance${wrappedMethod(isWrapped)}Expected`](...args)) as Decimal
    }
  },
  category: 'dex.pool',
  validationSuite: withdrawQueryValidationSuite,
})

export const useWithdrawLp = (params: WithdrawParams) => {
  const expectedLp = q(useWithdrawExpected(params))
  return { expectedLp, maximumLp: mapQuery(expectedLp, expected => getMaximumWithdrawBurn(expected, params)) }
}
