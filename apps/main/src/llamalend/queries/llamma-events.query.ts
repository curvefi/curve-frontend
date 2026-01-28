import { enforce, test } from 'vest'
import type { Chain, Address } from '@curvefi/prices-api'
import { getEvents, type Endpoint, type LlammaEvent } from '@curvefi/prices-api/llamma'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'

type LlammaEventsQuery = {
  blockchainId: Chain
  contractAddress: Address
  endpoint: Endpoint
  page?: number
  perPage?: number
}

export type LlammaEventsParams = FieldsOf<LlammaEventsQuery>

export type LlammaEventsResult = {
  events: LlammaEvent[]
  count: number
  page: number
  perPage: number
}

export const { useQuery: useLlammaEvents } = queryFactory({
  queryKey: ({ blockchainId, contractAddress, endpoint, page, perPage }: LlammaEventsParams) =>
    ['llamma-events', { blockchainId }, { contractAddress }, { endpoint }, { page }, { perPage }] as const,
  queryFn: async ({
    blockchainId,
    contractAddress,
    endpoint,
    page = 1,
    perPage = 100,
  }: LlammaEventsQuery): Promise<LlammaEventsResult> =>
    getEvents({
      endpoint,
      chain: blockchainId,
      llamma: contractAddress,
      page,
      perPage,
    }),
  staleTime: '1m',
  validationSuite: createValidationSuite(({ blockchainId, contractAddress, endpoint }: LlammaEventsParams) => {
    contractValidationGroup({ blockchainId, contractAddress })
    test('endpoint', 'Invalid endpoint', () => {
      enforce(endpoint).isNotEmpty().inside(['crvusd', 'lending'])
    })
  }),
})
