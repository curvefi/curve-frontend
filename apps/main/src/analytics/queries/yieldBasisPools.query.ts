import type { Chain } from '@curvefi/prices-api'
import { getYieldBasisPools } from '@curvefi/prices-api/yield-basis'
import { EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

type YieldBasisPoolsQuery = { chain: Chain }
type YieldBasisPoolsParams = FieldsOf<YieldBasisPoolsQuery>

export const { useQuery: useYieldBasisPools } = queryFactory({
  category: 'analytics.table',
  queryKey: ({ chain }: YieldBasisPoolsParams) => ['yield-basis-pools', { chain }] as const,
  queryFn: ({ chain }: YieldBasisPoolsQuery) => getYieldBasisPools(chain),
  validationSuite: EmptyValidationSuite,
})
