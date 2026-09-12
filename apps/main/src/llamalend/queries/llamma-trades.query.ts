import { test } from 'vest'
import { getTrades, type GetTradesParams } from '@curvefi/prices-api/llamma'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_START_INDEX } from '@evm-ui/features/activity-table/utils'
import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type LlammaTradesParams = FieldsOf<GetTradesParams>

export const { useQuery: useLlammaTrades } = queryFactory({
  queryKey: ({ chain, llamma, endpoint, page, perPage }: LlammaTradesParams) =>
    ['llamma-trades', { chain }, { llamma }, { endpoint }, { page }, { perPage }] as const,
  queryFn: async ({
    chain,
    llamma,
    endpoint,
    page = DEFAULT_PAGE_START_INDEX,
    perPage = DEFAULT_PAGE_SIZE,
  }: GetTradesParams) => getTrades({ endpoint, chain, llamma, page, perPage }),
  category: 'llamalend.user',
  validationSuite: createValidationSuite(({ chain, llamma, endpoint }: LlammaTradesParams) => {
    contractValidationGroup({ blockchainId: chain, contractAddress: llamma })
    test('endpoint', 'Invalid endpoint', () => {
      enforce(endpoint).isNotEmpty().inside(['crvusd', 'lending'])
    })
  }),
})
