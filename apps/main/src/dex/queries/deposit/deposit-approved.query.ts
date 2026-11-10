import { userDepositParamsValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositQuery, UserDepositParams } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import { depositMethod } from '@ui/features/pool-forms/pool-form.utils'

export const { useQuery: useDepositIsApproved, fetchQuery: fetchDepositIsApproved } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, userAddress, isWrapped, amounts }: UserDepositParams) =>
    ({ name: 'depositIsApproved', chainId, poolAddress, userAddress, isWrapped, amounts }) as const,
  queryFn: async ({ poolAddress, isWrapped, amounts }: DepositQuery) =>
    await requireLib('curveApi').getPool(poolAddress)[`${depositMethod(isWrapped)}IsApproved`](amounts),
  category: 'dex.pool',
  validationSuite: userDepositParamsValidationSuite,
})
