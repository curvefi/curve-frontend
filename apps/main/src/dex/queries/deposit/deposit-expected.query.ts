import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { depositMethod, getPoolAmounts, pickPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useDepositExpected } = queryFactory({
  queryKey: ({ chainId, poolId, isWrapped, slippage, decimals, ...values }: DepositParams) => ({
    name: 'depositExpected',
    ...rootKeys.pool({ chainId, poolId }),
    isWrapped,
    slippage,
    decimals,
    ...pickPoolAmounts(values, decimals?.length),
  }),
  queryFn: async ({ poolId, isWrapped, slippage, decimals, ...values }: DepositQuery) =>
    (await requireLib('curveApi')
      .getPool(poolId)
      [`${depositMethod(isWrapped)}Expected`](getPoolAmounts(values, decimals.length))) as Decimal,
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})
