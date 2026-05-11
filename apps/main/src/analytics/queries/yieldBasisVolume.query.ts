import type { Chain } from '@curvefi/prices-api'
import { getYieldBasisVolume } from '@curvefi/prices-api/yield-basis'
import { EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

type YieldBasisVolumeQuery = { chain: Chain }
type YieldBasisVolumeParams = FieldsOf<YieldBasisVolumeQuery>

export const { useQuery: useYieldBasisVolume } = queryFactory({
  category: 'analytics.chart',
  queryKey: ({ chain }: YieldBasisVolumeParams) => ['yield-basis-volume', { chain }] as const,
  queryFn: ({ chain }: YieldBasisVolumeQuery) => getYieldBasisVolume(chain),
  validationSuite: EmptyValidationSuite,
})
