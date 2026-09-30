import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { getDepositAmounts } from './deposit.utils'

export const { useQuery: useDepositBonus } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, slippage, decimals, ...values }: DepositParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'depositBonus',
      { isWrapped },
      { amounts: getPoolAmounts(values, decimals?.length) },
      { slippage },
    ] as const,
  queryFn: async (params: DepositQuery) => {
    const pool = requireLib('curveApi').getPool(params.poolId)
    const amounts = getDepositAmounts(params)
    return (params.isWrapped ? await pool.depositWrappedBonus(amounts) : await pool.depositBonus(amounts)) as Decimal
  },
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})
