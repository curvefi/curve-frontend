import { getPoolLiquidityEvents, GetPoolLiquidityEventsParams } from '@curvefi/prices-api/pools'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import { contractValidationGroup } from '@evm-ui/queries/validation/contract-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type PoolLiquidityEventsParams = FieldsOf<GetPoolLiquidityEventsParams>

export const { useQuery: usePoolLiquidityEvents } = queryFactory({
  queryKey: ({ blockchainId, poolAddress, page, perPage }: PoolLiquidityEventsParams) =>
    ({ name: 'pool-liquidity-events', blockchainId, poolAddress, page, perPage }) as const,
  queryFn: async ({
    blockchainId,
    poolAddress,
    page = DEFAULT_PAGE_START_INDEX,
    perPage = DEFAULT_PAGE_SIZE,
  }: GetPoolLiquidityEventsParams) => getPoolLiquidityEvents({ blockchainId, poolAddress, page, perPage }),
  validationSuite: createValidationSuite(({ blockchainId, poolAddress }: PoolLiquidityEventsParams) => {
    contractValidationGroup({ blockchainId, contractAddress: poolAddress })
  }),
  category: 'dex.pool',
})
