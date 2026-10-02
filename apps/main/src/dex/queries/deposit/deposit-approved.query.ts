import { userDepositParamsValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositQuery, UserDepositParams } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { depositMethod } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useDepositIsApproved, fetchQuery: fetchDepositIsApproved } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, amounts }: UserDepositParams) => ({
    name: 'depositIsApproved',
    ...rootKeys.userPool({ chainId, poolId, userAddress }),
    isWrapped,
    amounts,
  }),
  queryFn: async ({ poolId, isWrapped, amounts }: DepositQuery) =>
    await requireLib('curveApi').getPool(poolId)[`${depositMethod(isWrapped)}IsApproved`](amounts),
  category: 'dex.pool',
  validationSuite: userDepositParamsValidationSuite,
})
