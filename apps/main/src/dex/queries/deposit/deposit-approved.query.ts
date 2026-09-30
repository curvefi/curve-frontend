import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { getDepositAmounts } from './deposit.utils'

export const { useQuery: useDepositIsApproved, fetchQuery: fetchDepositIsApproved } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, decimals, ...values }: DepositParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'depositIsApproved',
      { isWrapped },
      { amounts: getPoolAmounts(values, decimals?.length) },
    ] as const,
  queryFn: async (params: DepositQuery) => {
    const pool = requireLib('curveApi').getPool(params.poolId)
    const amounts = getDepositAmounts(params)
    return params.isWrapped ? await pool.depositWrappedIsApproved(amounts) : await pool.depositIsApproved(amounts)
  },
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})
