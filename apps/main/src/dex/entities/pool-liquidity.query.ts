import type { Chain } from '@curvefi/prices-api'
import { getPoolLiquidityEvents, type PoolLiquidityEvent } from '@curvefi/prices-api/pools'
import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'
import type { Address } from '@ui-kit/utils'

export type PoolLiquidityEventsQuery = {
  blockchainId: Chain
  poolAddress: Address
  page?: number
  perPage?: number
}

export type PoolLiquidityEventsResult = {
  chain: string
  address: string
  events: PoolLiquidityEvent[]
  page: number
  perPage: number
  count: number
}

export const { useQuery: usePoolLiquidityEvents } = queryFactory({
  queryKey: ({ blockchainId, poolAddress, page, perPage }: PoolLiquidityEventsQuery) =>
    ['pool-liquidity-events', { blockchainId }, { poolAddress }, { page }, { perPage }] as const,
  queryFn: async ({
    blockchainId,
    poolAddress,
    page = 1,
    perPage = 100,
  }: PoolLiquidityEventsQuery): Promise<PoolLiquidityEventsResult> =>
    getPoolLiquidityEvents({
      chain: blockchainId,
      poolAddress,
      page,
      perPage,
    }),
  staleTime: '1m',
  validationSuite: createValidationSuite(({ blockchainId, poolAddress }: PoolLiquidityEventsQuery) => {
    contractValidationGroup({ blockchainId, contractAddress: poolAddress })
  }),
})
