import { getVaultEvents, type PaginatedOptions } from '@curvefi/prices-api/llamalend'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { ContractQuery } from '@evm-ui/queries/root-keys'
import { contractValidationSuite } from '@evm-ui/queries/validation/contract-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'

type MarketVaultEventsQuery = ContractQuery & Required<Pick<PaginatedOptions, 'page' | 'perPage'>>
type MarketVaultEventsParams = FieldsOf<MarketVaultEventsQuery>

export const { useQuery: useMarketVaultEvents } = queryFactory({
  queryKey: ({ blockchainId, contractAddress, page, perPage }: MarketVaultEventsParams) =>
    [rootKeys.contract({ blockchainId, contractAddress }), { name: 'vault-events', page, perPage }] as const,
  queryFn: ({ blockchainId, contractAddress, page, perPage }: MarketVaultEventsQuery) =>
    getVaultEvents(blockchainId, contractAddress, { page, perPage }),
  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})
