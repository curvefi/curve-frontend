import { enforce, test } from 'vest'
import type { Chain, Address } from '@curvefi/prices-api'
import { getTrades, type Endpoint, type LlammaTrade } from '@curvefi/prices-api/llamma'
import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'

export type LlammaTradesQuery = {
  blockchainId: Chain
  contractAddress: Address
  endpoint: Endpoint
  page?: number
  perPage?: number
}

export type LlammaTradesResult = {
  trades: LlammaTrade[]
  count: number
  page: number
  perPage: number
}

export const { useQuery: useLlammaTrades } = queryFactory({
  queryKey: ({ blockchainId, contractAddress, endpoint, page, perPage }: LlammaTradesQuery) =>
    ['llamma-trades', { blockchainId }, { contractAddress }, { endpoint }, { page }, { perPage }] as const,
  queryFn: async ({
    blockchainId,
    contractAddress,
    endpoint,
    page = 1,
    perPage = 100,
  }: LlammaTradesQuery): Promise<LlammaTradesResult> =>
    getTrades({
      endpoint,
      chain: blockchainId,
      llamma: contractAddress,
      page,
      perPage,
    }),
  staleTime: '1m',
  validationSuite: createValidationSuite(({ blockchainId, contractAddress, endpoint }: LlammaTradesQuery) => {
    contractValidationGroup({ blockchainId, contractAddress })
    test('endpoint', 'Invalid endpoint', () => {
      enforce(endpoint).isNotEmpty().inside(['crvusd', 'lending'])
    })
  }),
})
