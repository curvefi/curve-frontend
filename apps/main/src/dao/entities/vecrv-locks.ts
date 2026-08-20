import { getLocksDaily, type LocksDaily } from '@curvefi/prices-api/dao'
import type { Decimal } from '@primitives/decimal.utils'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'
import { queryFactory } from '@evm-ui/lib/model/query'
import { EmptyValidationSuite, type FieldsOf } from '@evm-ui/lib/validation'
import { fromWei } from '@evm-ui/utils'

type VeCrvLocksQuery = { days: number }
type VeCrvLocksParams = FieldsOf<VeCrvLocksQuery>

export type VeCrvLock = Omit<LocksDaily, 'amount'> & {
  amount: Decimal
}

export const { useQuery: useVeCrvLocksQuery } = queryFactory({
  queryKey: ({ days }: VeCrvLocksParams) => ['vecrv-locks', { days }] as const,
  queryFn: async ({ days }: VeCrvLocksQuery) =>
    (await getLocksDaily(days)).map(({ amount, ...lock }): VeCrvLock => ({
      ...lock,
      amount: fromWei(amount.toString(), DEFAULT_DECIMALS),
    })),
  category: 'dao.stats',
  validationSuite: EmptyValidationSuite,
})
