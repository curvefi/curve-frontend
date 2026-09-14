import { getDistributions, getDistributionsPage, type Distribution } from '@curvefi/prices-api/revenue'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { decimal } from '@ui/lib/decimal'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type VeCrvFeesQuery = { weeks?: number }
type VeCrvFeesParams = FieldsOf<VeCrvFeesQuery>

export type VeCrvFee = Omit<Distribution, 'feesUsd'> & { feesUsd: Decimal }

export const { useQuery: useVeCrvFeesQuery } = queryFactory({
  queryKey: ({ weeks }: VeCrvFeesParams) => ['vecrv-fees', { weeks }] as const,
  queryFn: async ({ weeks }: VeCrvFeesQuery) => {
    const distributions = await (weeks ? getDistributionsPage({ per_page: weeks }) : getDistributions())

    return distributions.map(({ feesUsd, ...fee }: Distribution): VeCrvFee => ({ ...fee, feesUsd: decimal(feesUsd)! }))
  },
  category: 'dao.stats',
  validationSuite: EmptyValidationSuite,
})
