import { getLocksDaily, type LocksDaily } from '@curvefi/prices-api/dao'
import { fromWei } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type VeCrvLocksQuery = { days: number }
type VeCrvLocksParams = FieldsOf<VeCrvLocksQuery>

export type VeCrvLock = Omit<LocksDaily, 'amount'> & { amount: Decimal }

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
