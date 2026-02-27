import { enforce, test } from 'vest'
import { getTrades, type GetTradesParams } from '@curvefi/prices-api/llamma'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@ui-kit/features/activity-table/constants'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'

export type LlammaTradesParams = FieldsOf<GetTradesParams>

export const { useQuery: useLlammaTrades } = queryFactory({
  queryKey: ({ chain, llamma, endpoint, page, perPage }: LlammaTradesParams) =>
    ['llamma-trades', { chain }, { llamma }, { endpoint }, { page }, { perPage }] as const,
  queryFn: async ({
    chain,
    llamma,
    endpoint,
    page = DEFAULT_PAGE_START_INDEX,
    perPage = DEFAULT_PAGE_SIZE,
  }: GetTradesParams) =>
    getTrades({
      endpoint,
      chain,
      llamma,
      page,
      perPage,
    }),
  category: 'llamalend.user',
  validationSuite: createValidationSuite(({ chain, llamma, endpoint }: LlammaTradesParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: llamma })
    test('endpoint', 'Invalid endpoint', () => {
      enforce(endpoint).isNotEmpty().inside(['crvusd', 'lending'])
    })
  }),
})
