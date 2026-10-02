import { depositQueryValidationSuite } from '@/dex/features/deposit/deposit.validation'
import type { DepositParams, DepositQuery } from '@/dex/features/deposit/types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { getDepositType, getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery } from '@ui/features/queries/util'
import { decimalMinus } from '@ui/lib/decimal'

export const { useQuery: useDepositBonus } = queryFactory({
  queryKey: ({ chainId, poolId, isWrapped, slippage, decimals, ...values }: DepositParams) => ({
    name: 'depositBonus',
    ...rootKeys.pool({ chainId, poolId }),
    isWrapped,
    amounts: getPoolAmounts(values, decimals?.length),
    slippage,
  }),
  queryFn: async ({ poolId, decimals, isWrapped, ...values }: DepositQuery) =>
    (await requireLib('curveApi')
      .getPool(poolId)
      [`${getDepositType(isWrapped)}Bonus`](getPoolAmounts(values, decimals.length) as Decimal[])) as Decimal,
  category: 'dex.pool',
  validationSuite: depositQueryValidationSuite,
})

export const useDepositPriceImpact = (params: DepositParams, enabled: boolean) =>
  mapQuery(useDepositBonus(params, enabled), bonus => decimalMinus('0', bonus))
