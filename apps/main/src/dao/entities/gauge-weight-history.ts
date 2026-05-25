import { sortBy } from 'lodash'
import { getWeightHistory } from '@curvefi/prices-api/gauge'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

export type { WeightHistory as GaugeWeightHistoryData } from '@curvefi/prices-api/gauge'

export const { useQuery: useGaugeWeightHistoryQuery } = queryFactory({
  queryKey: (params: { gaugeAddress: string }) =>
    ['gauge-weight-history', { gaugeAddress: params.gaugeAddress.toLowerCase() }] as const,
  queryFn: async ({ gaugeAddress }: { gaugeAddress: string }) =>
    sortBy(await getWeightHistory(gaugeAddress), 'timestamp'),
  category: 'dao.gauges',
  validationSuite: EmptyValidationSuite,
})
