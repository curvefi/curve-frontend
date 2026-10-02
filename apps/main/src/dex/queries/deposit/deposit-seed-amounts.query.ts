import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useSeedAmounts } = queryFactory({
  queryKey: ({ chainId, poolId, isWrapped, decimals, ...values }: DepositParams) => ({
    name: 'depositSeedAmounts',
    ...rootKeys.pool({ chainId, poolId }),
    isWrapped,
    amounts: getPoolAmounts(values, decimals?.length),
  }),
  queryFn: async ({ chainId, poolId, isWrapped, decimals, ...values }: DepositQuery) =>
    (await requireLib('curveApi')
      .getPool(poolId)
      .getSeedAmounts(getPoolAmounts(values, decimals.length)[0]!, !isWrapped)) as Decimal[],
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})
