import { userDepositParamsValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositQuery, UserDepositParams } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { getDepositType, getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useDepositIsApproved, fetchQuery: fetchDepositIsApproved } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, decimals, ...values }: UserDepositParams) => ({
    name: 'depositIsApproved',
    ...rootKeys.userPool({ chainId, poolId, userAddress }),
    isWrapped,
    amounts: getPoolAmounts(values, decimals?.length),
  }),
  queryFn: async ({ poolId, isWrapped, decimals, ...params }: DepositQuery) =>
    await requireLib('curveApi')
      .getPool(poolId)
      [`${getDepositType(isWrapped)}IsApproved`](getPoolAmounts(params, decimals.length) as Decimal[]),
  category: 'dex.pool',
  validationSuite: userDepositParamsValidationSuite,
})
