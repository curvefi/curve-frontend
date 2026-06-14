import { getLocksDaily, type LocksDaily } from '@curvefi/prices-api/dao'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { fromWei } from '@ui-kit/utils'

export type VeCrvLock = Omit<LocksDaily, 'amount'> & {
  amount: Decimal
}

export const { useQuery: useVeCrvLocksQuery } = queryFactory({
  queryKey: () => ['vecrv-locks'] as const,
  queryFn: async () =>
    (await getLocksDaily(365)).map(
      ({ amount, ...lock }): VeCrvLock => ({
        ...lock,
        amount: fromWei(amount.toString(), 18),
      }),
    ),
  category: 'dao.stats',
  validationSuite: EmptyValidationSuite,
})
