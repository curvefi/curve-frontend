import { getRefuelTimeseries } from '@curvefi/prices-api/refuel'
import type { Address } from '@primitives/address.utils'
import { DEFAULT_PAGE_START_INDEX } from '@ui-kit/features/activity-table/constants'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainNameQuery } from '@ui-kit/lib/model'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'

export const REFUEL_TIMESERIES_PAGE_SIZE = 1000

type RefuelTimeseriesQuery = ChainNameQuery & {
  poolAddress: Address
  start?: number
  end?: number
  page?: number
  pageSize?: number
}

type RefuelTimeseriesParams = FieldsOf<RefuelTimeseriesQuery>

export const { useQuery: useRefuelTimeseries } = queryFactory({
  queryKey: ({ blockchainId, poolAddress, start, end, page, pageSize }: RefuelTimeseriesParams) =>
    [
      ...rootKeys.chainName({ blockchainId }),
      'getRefuelTimeseries',
      { poolAddress },
      { start },
      { end },
      { page },
      { pageSize },
    ] as const,
  queryFn: async ({
    blockchainId,
    poolAddress,
    start,
    end,
    page = DEFAULT_PAGE_START_INDEX,
    pageSize = REFUEL_TIMESERIES_PAGE_SIZE,
  }: RefuelTimeseriesQuery) =>
    getRefuelTimeseries({
      chain: blockchainId,
      poolAddress,
      start,
      end,
      page,
      pageSize,
    }),
  validationSuite: createValidationSuite(({ blockchainId, poolAddress }: RefuelTimeseriesParams) => {
    contractValidationGroup({ blockchainId, contractAddress: poolAddress })
  }),
  category: 'analytics.chart',
  keepPreviousData: true,
})
