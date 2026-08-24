import { enforce, test } from 'vest'
import { getEvents, type GetEventsParams } from '@curvefi/prices-api/llamma'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import { createValidationSuite, type FieldsOf } from '@evm-ui/lib'
import { queryFactory } from '@evm-ui/lib/model/query'
import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'

type LlammaEventsParams = FieldsOf<GetEventsParams>

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
  category: 'llamalend.user',
  validationSuite: createValidationSuite(({ chain, llamma, endpoint }: LlammaEventsParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: llamma })
    test('endpoint', 'Invalid endpoint', () => {
      enforce(endpoint).isNotEmpty().inside(['crvusd', 'lending'])
    })
  }),
})
