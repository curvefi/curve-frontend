import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { depositMethod } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useDepositExpected, invalidate: invalidateDepositExpected } = queryFactory({
  queryKey: ({ chainId, poolAddress, isWrapped, amounts }: DepositParams) =>
    ({ name: 'depositExpected', chainId, poolAddress, isWrapped, amounts }) as const,
  queryFn: async ({ poolAddress, isWrapped, amounts }: DepositQuery) =>
    (await requireLib('curveApi').getPool(poolAddress)[`${depositMethod(isWrapped)}Expected`](amounts)) as Decimal,
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})
