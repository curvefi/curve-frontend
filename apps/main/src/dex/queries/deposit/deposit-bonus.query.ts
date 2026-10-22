import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { Decimal } from '@primitives/decimal.utils'
import { depositMethod } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'

export const { useQuery: useDepositBonus } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress, isWrapped, amounts }: DepositParams) =>
    ({ name: 'depositBonus', chainId, poolAddress, isWrapped, amounts }) as const,
  queryFn: async ({ poolAddress, isWrapped, amounts }: DepositQuery) =>
    (await requireLib('curveApi').getPool(poolAddress)[`${depositMethod(isWrapped)}Bonus`](amounts)) as Decimal,
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})

export const useDepositPriceImpact = (params: DepositParams, enabled: boolean) =>
  mapQuery(useDepositBonus(params, enabled), bonus => decimalMinus('0', bonus))
