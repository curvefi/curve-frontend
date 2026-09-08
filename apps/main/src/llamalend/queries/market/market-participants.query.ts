import { getMarketBorrowers, getVaultDepositors, type PaginatedOptions } from '@curvefi/prices-api/llamalend'
import type { FieldsOf } from '@evm-ui/lib'
import { queryFactory, rootKeys } from '@evm-ui/lib/model/query'
import { contractValidationSuite } from '@evm-ui/lib/model/query/contract-validation'
import type { ContractQuery } from '@evm-ui/lib/model/query/root-keys'

type MarketParticipantsQuery = ContractQuery & Required<Pick<PaginatedOptions, 'page' | 'perPage'>>
type MarketParticipantsParams = FieldsOf<MarketParticipantsQuery>

const participantQueryKey = (
  type: 'borrowers' | 'suppliers',
  { blockchainId, contractAddress, page, perPage }: MarketParticipantsParams,
) => [...rootKeys.contract({ blockchainId, contractAddress }), type, { page }, { perPage }] as const

export const { useQuery: useMarketBorrowers, queryKey: getMarketBorrowersKey } = queryFactory({
  queryKey: (params: MarketParticipantsParams) => participantQueryKey('borrowers', params),
  queryFn: ({ blockchainId, contractAddress, page, perPage }: MarketParticipantsQuery) =>
    getMarketBorrowers(blockchainId, contractAddress, { page, perPage }),
  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})

export const { useQuery: useMarketSuppliers, queryKey: getMarketSuppliersKey } = queryFactory({
  queryKey: (params: MarketParticipantsParams) => participantQueryKey('suppliers', params),
  queryFn: ({ blockchainId, contractAddress, page, perPage }: MarketParticipantsQuery) =>
    getVaultDepositors(blockchainId, contractAddress, { page, perPage }),
  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})
