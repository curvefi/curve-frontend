import { test } from 'vest'
import { getEvents, type GetEventsParams } from '@curvefi/prices-api/llamma'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

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
  }: GetEventsParams) => getEvents({ endpoint, chain, llamma, page, perPage }),
  category: 'llamalend.user',
  validationSuite: createValidationSuite(({ chain, llamma, endpoint }: LlammaEventsParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: llamma })
    test('endpoint', 'Invalid endpoint', () => {
      enforce(endpoint).isNotEmpty().inside(['crvusd', 'lending'])
    })
  }),
})
