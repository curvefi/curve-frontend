import { getDistributions, type Distribution } from '@curvefi/prices-api/revenue'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { decimal } from '@ui-kit/utils'

export type VeCrvFee = Omit<Distribution, 'feesUsd'> & {
  feesUsd: Decimal
}

export const { useQuery: useVeCrvFeesQuery } = queryFactory({
  queryKey: () => ['vecrv-fees'] as const,
  queryFn: async () =>
    (await getDistributions()).map(
      ({ feesUsd, ...fee }): VeCrvFee => ({
        ...fee,
        feesUsd: decimal(feesUsd)!,
      }),
    ),
  category: 'dao.stats',
  validationSuite: EmptyValidationSuite,
})
