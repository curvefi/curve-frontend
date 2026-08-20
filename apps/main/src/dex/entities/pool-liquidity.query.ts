import { getPoolLiquidityEvents, GetPoolLiquidityEventsParams } from '@curvefi/prices-api/pools'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import { createValidationSuite, type FieldsOf } from '@evm-ui/lib'
import { queryFactory } from '@evm-ui/lib/model/query'
import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'

type PoolLiquidityEventsParams = FieldsOf<GetPoolLiquidityEventsParams>

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
  validationSuite: createValidationSuite(({ chain, poolAddress }: PoolLiquidityEventsParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: poolAddress })
  }),
  category: 'dex.pool',
})
