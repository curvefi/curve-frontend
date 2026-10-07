import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { depositMethod } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'

export const { useQuery: useDepositBonus } = queryFactory({
  queryKey: ({ chainId, poolId, isWrapped, amounts }: DepositParams) =>
    ({ name: 'depositBonus', chainId, poolId, isWrapped, amounts }) as const,
  queryFn: async ({ poolId, isWrapped, amounts }: DepositQuery) =>
    (await requireLib('curveApi').getPool(poolId)[`${depositMethod(isWrapped)}Bonus`](amounts)) as Decimal,
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})

export const useDepositPriceImpact = (params: DepositParams, enabled: boolean) =>
  mapQuery(useDepositBonus(params, enabled), bonus => decimalMinus('0', bonus))
