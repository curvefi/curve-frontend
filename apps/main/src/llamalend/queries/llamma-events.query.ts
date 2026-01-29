import { enforce, test } from 'vest'
import { getEvents, type GetEventsParams } from '@curvefi/prices-api/llamma'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@ui-kit/features/activity-table/constants'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'

export type LlammaEventsParams = FieldsOf<GetEventsParams>

export const { useQuery: useLlammaEvents } = queryFactory({
  queryKey: ({ chain, llamma, endpoint, page, perPage }: LlammaEventsParams) =>
    ['llamma-events', { chain }, { llamma }, { endpoint }, { page }, { perPage }] as const,
  queryFn: async ({
    chain,
    llamma,
    endpoint,
    page = DEFAULT_PAGE_START_INDEX,
    perPage = DEFAULT_PAGE_SIZE,
  }: GetEventsParams) =>
    getEvents({
      endpoint,
      chain,
      llamma,
      page,
      perPage,
    }),
  staleTime: '1m',
  validationSuite: createValidationSuite(({ chain, llamma, endpoint }: LlammaEventsParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: llamma })
    test('endpoint', 'Invalid endpoint', () => {
      enforce(endpoint).isNotEmpty().inside(['crvusd', 'lending'])
    })
  }),
})
