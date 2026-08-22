import { getDistributions, getDistributionsPage, type Distribution } from '@curvefi/prices-api/revenue'
import { queryFactory } from '@evm-ui/lib/model/query'
import { EmptyValidationSuite, type FieldsOf } from '@evm-ui/lib/validation'
import { decimal } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'

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
