import { getDistributions, type Distribution } from '@curvefi/prices-api/revenue'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib/validation'
import { decimal } from '@ui-kit/utils'

type VeCrvFeesQuery = {
  order?: 'asc' | 'desc'
  weeks?: number
}
type VeCrvFeesParams = FieldsOf<VeCrvFeesQuery>

export type VeCrvFee = Omit<Distribution, 'feesUsd'> & {
  feesUsd: Decimal
}

export const { useQuery: useVeCrvFeesQuery } = queryFactory({
  queryKey: ({ order, weeks }: VeCrvFeesParams) => ['vecrv-fees', { order }, { weeks }] as const,
  queryFn: async ({ order = 'desc', weeks }: VeCrvFeesQuery) => {
    const distributions = await getDistributions(weeks)
    const fees = distributions.slice(0, weeks).map(
      ({ feesUsd, ...fee }): VeCrvFee => ({
        ...fee,
        feesUsd: decimal(feesUsd)!,
      }),
    )

    return order === 'asc' ? fees.toReversed() : fees
  },
  category: 'dao.stats',
  validationSuite: EmptyValidationSuite,
})
