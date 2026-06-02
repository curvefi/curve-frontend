import { sortBy } from 'lodash'
import { getWeightHistory } from '@curvefi/prices-api/gauge'
import type { Address } from '@primitives/address.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { evmAddressValidationGroup } from '@ui-kit/lib/model/query/evm-address-validation'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib/validation'

export type { WeightHistory as GaugeWeightHistoryData } from '@curvefi/prices-api/gauge'

type Query = {
  gaugeAddress: Address
}
type QueryParams = FieldsOf<Query>

export const { useQuery: useGaugeWeightHistoryQuery } = queryFactory({
  queryKey: ({ gaugeAddress }: QueryParams) =>
    ['gauge-getWeightHistory', { gaugeAddress: gaugeAddress?.toLowerCase() }] as const,
  queryFn: async ({ gaugeAddress }: Query) => sortBy(await getWeightHistory(gaugeAddress), 'timestamp'),
  category: 'dao.gauges',
  validationSuite: createValidationSuite(({ gaugeAddress }: QueryParams) => {
    evmAddressValidationGroup({ evmAddress: gaugeAddress })
  }),
})
