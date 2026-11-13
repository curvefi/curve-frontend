import type { WithdrawMaxParams, WithdrawMaxQuery } from '@/dex/features/withdraw/types'
import { withdrawMaxValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import { getPool } from '@/dex/pool.utils'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { Decimal } from '@primitives/decimal.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'

export const { useQuery: useWithdrawMaxAmount, invalidate: invalidateWithdrawMaxAmounts } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, isWrapped, lpAmount, index }: WithdrawMaxParams) =>
    ({ name: 'withdrawMaxAmounts', chainId, poolAddress, isWrapped, lpAmount, index }) as const,
  queryFn: async ({ poolAddress, isWrapped, lpAmount, index }: WithdrawMaxQuery) =>
    +lpAmount
      ? ((await getPool(poolAddress)[`withdrawOneCoin${wrappedMethod(isWrapped)}Expected`](lpAmount, index)) as Decimal)
      : '0',
  category: 'dex.pool',
  validationSuite: withdrawMaxValidationSuite,
})
