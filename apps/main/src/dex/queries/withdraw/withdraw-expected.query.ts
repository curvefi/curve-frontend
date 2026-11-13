import type { WithdrawParams, WithdrawQuery } from '@/dex/features/withdraw/types'
import { withdrawQueryValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import { getPool } from '@/dex/pool.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useWithdrawExpectedLp, invalidate: invalidateWithdrawExpectedLp } = queryFactory({
  queryKey: ({ chainId, poolAddress, isWrapped, amounts, maxLpAmount, ...params }: WithdrawParams) =>
    ({
      name: 'withdrawExpected',
      chainId,
      poolAddress,
      isWrapped,
      mode: params.mode,
      amounts,
      maxLpAmount,
      ...('lpAmount' in params && { lpAmount: params.lpAmount }),
      ...('tokenIndex' in params && { tokenIndex: params.tokenIndex }),
    }) as const,
  queryFn: async ({ poolAddress, isWrapped, amounts, ...params }: WithdrawQuery) => {
    if (params.mode === 'unbalanced') {
      return (await getPool(poolAddress)[`withdrawImbalance${wrappedMethod(isWrapped)}Expected`](amounts)) as Decimal
    }
    return params.lpAmount
  },
  category: 'dex.pool',
  validationSuite: withdrawQueryValidationSuite,
})
