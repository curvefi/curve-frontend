import { enforce, test } from 'vest'
import type { Chain } from '@curvefi/prices-api'
import { getPoolTrades, type PoolTrade, type TradeToken } from '@curvefi/prices-api/pools'
import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'
import type { Address } from '@ui-kit/utils'

export type PoolTradesQuery = {
  blockchainId: Chain
  poolAddress: Address
  mainToken: Address
  referenceToken: Address
  page?: number
  perPage?: number
}

export type PoolTradesResult = {
  chain: string
  address: string
  mainToken: TradeToken
  referenceToken: TradeToken
  trades: PoolTrade[]
  page: number
  perPage: number
  count: number
}

export const { useQuery: usePoolTrades } = queryFactory({
  queryKey: ({ blockchainId, poolAddress, mainToken, referenceToken, page, perPage }: PoolTradesQuery) =>
    [
      'pool-trades',
      { blockchainId },
      { poolAddress },
      { mainToken },
      { referenceToken },
      { page },
      { perPage },
    ] as const,
  queryFn: async ({
    blockchainId,
    poolAddress,
    mainToken,
    referenceToken,
    page = 1,
    perPage = 100,
  }: PoolTradesQuery): Promise<PoolTradesResult> =>
    getPoolTrades({
      chain: blockchainId,
      poolAddress,
      mainToken,
      referenceToken,
      page,
      perPage,
    }),
  staleTime: '1m',
  validationSuite: createValidationSuite(
    ({ blockchainId, poolAddress, mainToken, referenceToken }: PoolTradesQuery) => {
      contractValidationGroup({ blockchainId, contractAddress: poolAddress })
      test('mainToken', 'Invalid main token address', () => {
        enforce(mainToken).isNotEmpty().isAddress()
      })
      test('referenceToken', 'Invalid reference token address', () => {
        enforce(referenceToken).isNotEmpty().isAddress()
      })
    },
  ),
})
