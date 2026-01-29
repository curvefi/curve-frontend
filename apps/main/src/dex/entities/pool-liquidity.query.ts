import { getPoolLiquidityEvents, GetPoolLiquidityEventsParams } from '@curvefi/prices-api/pools'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@ui-kit/features/activity-table/constants'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'

export type PoolLiquidityEventsParams = FieldsOf<GetPoolLiquidityEventsParams>

export const { useQuery: usePoolLiquidityEvents } = queryFactory({
  queryKey: ({ chain, poolAddress, page, perPage }: PoolLiquidityEventsParams) =>
    ['pool-liquidity-events', { chain }, { poolAddress }, { page }, { perPage }] as const,
  queryFn: async ({
    chain,
    poolAddress,
    page = DEFAULT_PAGE_START_INDEX,
    perPage = DEFAULT_PAGE_SIZE,
  }: GetPoolLiquidityEventsParams) =>
    getPoolLiquidityEvents({
      chain,
      poolAddress,
      page,
      perPage,
    }),
  staleTime: '1m',
  validationSuite: createValidationSuite(({ chain, poolAddress }: PoolLiquidityEventsParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: poolAddress })
  }),
})
