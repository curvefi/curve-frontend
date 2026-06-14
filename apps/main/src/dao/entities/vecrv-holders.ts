import { getLockers, type Locker } from '@curvefi/prices-api/dao'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { decimal, fromWei } from '@ui-kit/utils'

export type VeCrvHolder = Omit<Locker, 'locked' | 'weight' | 'weightRatio'> & {
  locked: Decimal
  weight: Decimal
  weightRatio: Decimal
}

export const { useQuery: useVeCrvHoldersQuery } = queryFactory({
  queryKey: () => ['vecrv-holders'] as const,
  queryFn: async () =>
    (await getLockers()).map(
      ({ locked, weight, weightRatio, ...holder }): VeCrvHolder => ({
        ...holder,
        locked: fromWei(locked.toString(), 18),
        weight: fromWei(weight.toString(), 18),
        weightRatio: decimal(weightRatio)!,
      }),
    ),
  category: 'dao.stats',
  validationSuite: EmptyValidationSuite,
})
