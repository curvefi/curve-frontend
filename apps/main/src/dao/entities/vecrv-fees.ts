import { getDistributions, getDistributionsPage, type Distribution } from '@curvefi/prices-api/revenue'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib/validation'
import { decimal } from '@ui-kit/utils'

type VeCrvFeesQuery = {
  weeks?: number
}
type VeCrvFeesParams = FieldsOf<VeCrvFeesQuery>

export type VeCrvFee = Omit<Distribution, 'feesUsd'> & {
  feesUsd: Decimal
}

export const { useQuery: useVeCrvFeesQuery } = queryFactory({
  queryKey: ({ weeks }: VeCrvFeesParams) => ['vecrv-fees', { weeks }] as const,
  queryFn: async ({ weeks }: VeCrvFeesQuery) => {
    const distributions = await (weeks ? getDistributionsPage({ per_page: weeks }) : getDistributions())

    return distributions.map(({ feesUsd, ...fee }: Distribution): VeCrvFee => ({ ...fee, feesUsd: decimal(feesUsd)! }))
  },
  category: 'dao.stats',
  validationSuite: EmptyValidationSuite,
})
