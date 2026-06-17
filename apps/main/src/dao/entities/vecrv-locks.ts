import { getLocksDaily, type LocksDaily } from '@curvefi/prices-api/dao'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib/validation'
import { fromWei } from '@ui-kit/utils'

type VeCrvLocksQuery = { days: number }
type VeCrvLocksParams = FieldsOf<VeCrvLocksQuery>

export type VeCrvLock = Omit<LocksDaily, 'amount'> & {
  amount: Decimal
}

export const { useQuery: useVeCrvLocksQuery } = queryFactory({
  queryKey: ({ days }: VeCrvLocksParams) => ['vecrv-locks', { days }] as const,
  queryFn: async ({ days }: VeCrvLocksQuery) =>
    (await getLocksDaily(days)).map(
      ({ amount, ...lock }): VeCrvLock => ({
        ...lock,
        amount: fromWei(amount.toString(), 18),
      }),
    ),
  category: 'dao.stats',
  validationSuite: EmptyValidationSuite,
})
