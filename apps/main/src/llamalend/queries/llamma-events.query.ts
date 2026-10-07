import { test } from 'vest'
import { getEvents, type GetEventsParams } from '@curvefi/prices-api/llamma'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import { contractValidationGroup } from '@evm-ui/queries/validation/contract-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type LlammaEventsParams = FieldsOf<GetEventsParams>

export const { useQuery: useLlammaEvents } = queryFactory({
  queryKey: ({ blockchainId, llamma, endpoint, page, perPage }: LlammaEventsParams) =>
    ({ name: 'llamma-events', blockchainId, llamma, endpoint, page, perPage }) as const,
  queryFn: async ({
    blockchainId,
    llamma,
    endpoint,
    page = DEFAULT_PAGE_START_INDEX,
    perPage = DEFAULT_PAGE_SIZE,
  }: GetEventsParams) => getEvents({ endpoint, blockchainId, llamma, page, perPage }),
  category: 'llamalend.user',
  validationSuite: createValidationSuite(({ blockchainId, llamma, endpoint }: LlammaEventsParams) => {
    contractValidationGroup({ blockchainId, contractAddress: llamma })
    test('endpoint', 'Invalid endpoint', () => {
      enforce(endpoint).isNotEmpty().inside(['crvusd', 'lending'])
    })
  }),
})
