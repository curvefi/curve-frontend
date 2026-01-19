import type { Chain } from '@curvefi/prices-api'
import { getAllPoolTrades, type AllPoolTrade } from '@curvefi/prices-api/pools'
import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'
import type { Address } from '@ui-kit/utils'

export type PoolTradesQuery = {
  blockchainId: Chain
  poolAddress: Address
  page?: number
  perPage?: number
  includeState?: boolean
}

export type PoolTradesResult = {
  chain: string
  address: string
  trades: AllPoolTrade[]
  page: number
  perPage: number
  count: number
}

export const { useQuery: usePoolTrades } = queryFactory({
  queryKey: ({ blockchainId, poolAddress, page, perPage }: PoolTradesQuery) =>
    ['pool-trades', { blockchainId }, { poolAddress }, { page }, { perPage }] as const,
  queryFn: async ({
    blockchainId,
    poolAddress,
    page = 1,
    perPage = 100,
    includeState = false,
  }: PoolTradesQuery): Promise<PoolTradesResult> =>
    getAllPoolTrades({
      chain: blockchainId,
      poolAddress,
      page,
      perPage,
      includeState,
    }),
  staleTime: '1m',
  validationSuite: createValidationSuite(({ blockchainId, poolAddress }: PoolTradesQuery) => {
    contractValidationGroup({ blockchainId, contractAddress: poolAddress })
  }),
})
