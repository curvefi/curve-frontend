import { getMarketEndpoint } from '@/llamalend/llama.utils'
import { getMarketBorrowers, getVaultDepositors, type PaginatedOptions } from '@curvefi/prices-api/llamalend'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { ContractQuery } from '@evm-ui/queries/root-keys'
import { contractValidationSuite } from '@evm-ui/queries/validation/contract-validation'
import { MarketType } from '@evm-ui/types/market'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'

type MarketParticipantsQuery = ContractQuery & Required<Pick<PaginatedOptions, 'page' | 'perPage'>>
type MarketParticipantsParams = FieldsOf<MarketParticipantsQuery>
type MarketBorrowersQuery = MarketParticipantsQuery & { marketType: MarketType }

const participantQueryKey = (
  type: 'borrowers' | 'suppliers',
  { blockchainId, contractAddress, page, perPage }: MarketParticipantsParams,
) => [...rootKeys.contract({ blockchainId, contractAddress }), type, { page }, { perPage }] as const

export const { useQuery: useMarketBorrowers } = queryFactory({
  queryKey: ({ marketType, ...params }: FieldsOf<MarketBorrowersQuery>) =>
    [...participantQueryKey('borrowers', params), { marketType }] as const,
  queryFn: ({ blockchainId, contractAddress, marketType, page, perPage }: MarketBorrowersQuery) =>
    getMarketBorrowers(blockchainId, contractAddress, { endpoint: getMarketEndpoint(marketType), page, perPage }),

  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})

export const { useQuery: useMarketSuppliers } = queryFactory({
  queryKey: (params: MarketParticipantsParams) => participantQueryKey('suppliers', params),
  queryFn: ({ blockchainId, contractAddress, page, perPage }: MarketParticipantsQuery) =>
    getVaultDepositors(blockchainId, contractAddress, { page, perPage }),
  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})
