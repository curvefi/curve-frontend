import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { getPool } from '@/dex/pool.utils'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { Decimal } from '@primitives/decimal.utils'
import { depositMethod } from '@ui/features/pool-forms/pool-form.utils'

export const { useQuery: useDepositExpectedLp, invalidate: invalidateDepositExpectedLp } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, isWrapped, amounts }: DepositParams) =>
    ({ name: 'depositExpected', chainId, poolAddress, isWrapped, amounts }) as const,
  queryFn: async ({ poolAddress, isWrapped, amounts }: DepositQuery) =>
    (await getPool(poolAddress)[`${depositMethod(isWrapped)}Expected`](amounts)) as Decimal,
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})
