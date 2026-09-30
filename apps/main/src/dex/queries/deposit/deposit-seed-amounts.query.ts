import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { getDepositAmounts } from './deposit.utils'

export const { useQuery: useSeedAmounts } = queryFactory({
  queryKey: ({ chainId, poolId, userAddress, isWrapped, decimals, ...values }: DepositParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'depositSeedAmounts',
      { isWrapped },
      { amounts: getPoolAmounts(values, decimals?.length) },
    ] as const,
  queryFn: async (params: DepositQuery) =>
    (await requireLib('curveApi')
      .getPool(params.poolId)
      .getSeedAmounts(getDepositAmounts(params)[0], !params.isWrapped)) as Decimal[],
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})
