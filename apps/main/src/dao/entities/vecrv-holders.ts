import { getLockers, type Locker } from '@curvefi/prices-api/dao'
import { queryFactory } from '@evm-ui/lib/model/query'
import { EmptyValidationSuite } from '@evm-ui/lib/validation'
import { decimal, fromWei } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'

export type VeCrvHolder = Omit<Locker, 'locked' | 'weight' | 'weightRatio'> & {
  locked: Decimal
  weight: Decimal
  weightRatio: Decimal
}

export const { useQuery: useVeCrvHoldersQuery } = queryFactory({
  queryKey: () => ['vecrv-holders'] as const,
  queryFn: async () =>
    (await getLockers()).map(({ locked, weight, weightRatio, ...holder }): VeCrvHolder => ({
      ...holder,
      locked: fromWei(locked.toString(), DEFAULT_DECIMALS),
      weight: fromWei(weight.toString(), DEFAULT_DECIMALS),
      weightRatio: decimal(weightRatio)!,
    })),
  category: 'dao.stats',
  validationSuite: EmptyValidationSuite,
})
