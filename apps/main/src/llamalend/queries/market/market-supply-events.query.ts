import { getVaultEvents, type PaginatedOptions } from '@curvefi/prices-api/llamalend'
import type { ContractQuery } from '@evm-ui/queries/query-types'
import { contractValidationSuite } from '@evm-ui/queries/validation/contract-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'

type MarketSupplyEventsQuery = ContractQuery & Required<Pick<PaginatedOptions, 'page' | 'perPage'>>
type MarketSupplyEventsParams = FieldsOf<MarketSupplyEventsQuery>

export const { useQuery: useMarketSupplyEvents } = queryFactory({
  queryKey: ({ blockchainId, contractAddress, page, perPage }: MarketSupplyEventsParams) =>
    ({ name: 'vault-events', blockchainId, contractAddress, page, perPage }) as const,
  queryFn: ({ blockchainId, contractAddress, page, perPage }: MarketSupplyEventsQuery) =>
    getVaultEvents(blockchainId, contractAddress, { page, perPage }),
  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})
