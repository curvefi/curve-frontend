import { getAllPoolTrades, type GetAllPoolTradesParams } from '@curvefi/prices-api/pools'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@ui-kit/features/activity-table/constants'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'

export type PoolTradesParams = FieldsOf<GetAllPoolTradesParams>

export const { useQuery: usePoolTrades } = queryFactory({
  queryKey: ({ chain, poolAddress, page, perPage, includeState }: PoolTradesParams) =>
    ['pool-trades', { chain }, { poolAddress }, { page }, { perPage }, { includeState }] as const,
  queryFn: async ({
    chain,
    poolAddress,
    page = DEFAULT_PAGE_START_INDEX,
    perPage = DEFAULT_PAGE_SIZE,
    includeState = false,
  }: GetAllPoolTradesParams) =>
    getAllPoolTrades({
      chain,
      poolAddress,
      page,
      perPage,
      includeState,
    }),
  validationSuite: createValidationSuite(({ chain, poolAddress }: PoolTradesParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: poolAddress })
  }),
  category: 'dex.pool',
})
