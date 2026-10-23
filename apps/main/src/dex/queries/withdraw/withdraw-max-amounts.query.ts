import type { WithdrawMaxParams, WithdrawMaxQuery } from '@/dex/features/withdraw/types'
import { withdrawMaxValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { getQueryOptions: getWithdrawMaxAmountQueryOptions, invalidate: invalidateWithdrawMaxAmounts } =
  queryFactory({
    queryKey: ({ chainId, poolAddress, isWrapped, lpAmount, index }: WithdrawMaxParams) =>
      ({ name: 'withdrawMaxAmounts', chainId, poolAddress, isWrapped, lpAmount, index }) as const,
    queryFn: async ({ poolAddress, isWrapped, lpAmount, index }: WithdrawMaxQuery) => {
      if (!+lpAmount) return '0'
      return (await requireLib('curveApi')
        .getPool(poolAddress)
        [`withdrawOneCoin${wrappedMethod(isWrapped)}Expected`](lpAmount, index)) as Decimal
    },
    category: 'dex.pool',
    validationSuite: withdrawMaxValidationSuite,
  })
