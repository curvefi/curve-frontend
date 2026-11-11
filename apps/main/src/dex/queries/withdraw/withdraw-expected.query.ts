import type { WithdrawParams, WithdrawQuery } from '@/dex/features/withdraw/types'
import { getMaximumWithdrawBurn } from '@/dex/features/withdraw/withdraw.utils'
import { withdrawQueryValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery, q } from '@ui/features/queries/util'

export const { useQuery: useWithdrawExpected, invalidate: invalidateWithdrawExpected } = queryFactory({
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
      return (await requireLib('curveApi')
        .getPool(poolAddress)
        [`withdrawImbalance${wrappedMethod(isWrapped)}Expected`](amounts)) as Decimal
    }
    return params.lpAmount
  },
  category: 'dex.pool',
  validationSuite: withdrawQueryValidationSuite,
})

export const useWithdrawLp = (params: WithdrawParams) => {
  const expectedLp = q(useWithdrawExpected(params))
  return { expectedLp, maximumLp: mapQuery(expectedLp, expected => getMaximumWithdrawBurn(expected, params)) }
}
