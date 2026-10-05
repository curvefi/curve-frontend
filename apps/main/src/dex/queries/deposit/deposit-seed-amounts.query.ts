import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useSeedAmounts } = queryFactory({
  queryKey: ({ chainId, poolId, isWrapped, amounts }: DepositParams) =>
    ({ name: 'depositSeedAmounts', chainId, poolId, isWrapped, amounts }) as const,
  queryFn: async ({ poolId, isWrapped, amounts }: DepositQuery) =>
    (await requireLib('curveApi').getPool(poolId).getSeedAmounts(amounts[0], !isWrapped)) as Decimal[],
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})
