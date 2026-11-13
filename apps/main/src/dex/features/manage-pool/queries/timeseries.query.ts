import { paginate } from '@curvefi/prices-api/paginate'
import { getRefuelTimeseries } from '@curvefi/prices-api/refuel'
import { DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import type { ChainNameQuery } from '@evm-ui/queries/query-types'
import { contractValidationGroup } from '@evm-ui/queries/validation/contract-validation'
import type { Address } from '@primitives/address.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

const [PAGE_SIZE, LIMIT] = [100, 1000]

type RefuelTimeseriesQuery = ChainNameQuery & { poolAddress: Address; start?: number; end?: number }

type RefuelTimeseriesParams = FieldsOf<RefuelTimeseriesQuery>

export const { useQuery: useRefuelTimeseries } = queryFactory({
  queryKey: ({ blockchainId, poolAddress, start, end }: RefuelTimeseriesParams) =>
    ({ name: 'getRefuelTimeseries', blockchainId, poolAddress, start, end }) as const,
  queryFn: async ({ blockchainId, poolAddress, start, end }: RefuelTimeseriesQuery) => {
    const getTimeseries = async (page = DEFAULT_PAGE_START_INDEX) =>
      await getRefuelTimeseries({ blockchainId, poolAddress, start, end, page, pageSize: PAGE_SIZE })
    const first = await getTimeseries()
    const data = await paginate(async nextPage => (await getTimeseries(nextPage)).data, {
      page: 2,
      limit: LIMIT - first.data.length,
    })
    return { ...first, data: [...first.data, ...data] }
  },
  validationSuite: createValidationSuite(({ blockchainId, poolAddress }: RefuelTimeseriesParams) => {
    contractValidationGroup({ blockchainId, contractAddress: poolAddress })
  }),
  category: 'analytics.chart',
  keepPreviousData: true,
})

export type RefuelTimeSeriesData = NonNullable<ReturnType<typeof useRefuelTimeseries>['data']>
