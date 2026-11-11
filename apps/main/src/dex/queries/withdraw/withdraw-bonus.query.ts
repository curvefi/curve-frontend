import type { WithdrawParams, WithdrawQuery } from '@/dex/features/withdraw/types'
import { withdrawQueryValidationSuite } from '@/dex/features/withdraw/withdraw.validation'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery } from '@ui/features/queries/util'
import { decimalNegate } from '@ui/lib/decimal'

export const { useQuery: useWithdrawBonus, invalidate: invalidateWithdrawBonus } = queryFactory({
  queryKey: ({ chainId, poolAddress, isWrapped, amounts, maxLpAmount, ...params }: WithdrawParams) =>
    ({
      name: 'withdrawBonus',
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
    const pool = requireLib('curveApi').getPool(poolAddress)
    switch (params.mode) {
      case 'balanced':
        return '0'
      case 'unbalanced':
        return (await pool[`withdrawImbalance${wrappedMethod(isWrapped)}Bonus`](amounts)) as Decimal
      case 'one-coin':
        const { lpAmount, tokenIndex } = params
        return (await pool[`withdrawOneCoin${wrappedMethod(isWrapped)}Bonus`](lpAmount, tokenIndex)) as Decimal
    }
  },
  category: 'dex.pool',
  validationSuite: withdrawQueryValidationSuite,
})

export const useWithdrawPriceImpact = (params: WithdrawParams) => mapQuery(useWithdrawBonus(params), decimalNegate)
