import type { WithdrawParams, WithdrawQuery } from '@/dex/features/withdraw/types'
import { withdrawQueryValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery } from '@ui/features/queries/util'
import { decimalNegate } from '@ui/lib/decimal'
import { getWithdrawImplementation } from './withdraw-query.helpers'

export const { useQuery: useWithdrawBonus, invalidate: invalidateWithdrawBonus } = queryFactory({
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
      name: 'withdrawBonus',
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
        return '0'
      case 'imbalance':
        return (await impl[`withdrawImbalance${wrappedMethod(isWrapped)}Bonus`](...args)) as Decimal
      case 'oneCoin':
        return (await impl[`withdrawOneCoin${wrappedMethod(isWrapped)}Bonus`](...args)) as Decimal
    }
  },
  category: 'dex.pool',
  validationSuite: withdrawQueryValidationSuite,
})

export const useWithdrawPriceImpact = (params: WithdrawParams) => mapQuery(useWithdrawBonus(params), decimalNegate)
