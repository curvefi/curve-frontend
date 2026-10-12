import { getMarketEndpoint } from '@/llamalend/llama.utils'
import { getMarketBorrowers, getVaultDepositors, type PaginatedOptions } from '@curvefi/prices-api/llamalend'
import type { ContractQuery } from '@evm-ui/queries/query-types'
import { contractValidationSuite } from '@evm-ui/queries/validation/contract-validation'
import { MarketType } from '@evm-ui/types/market'
import { queryFactory } from '@ui/features/queries/factory'
import type { FieldsOf } from '@ui/lib/validation/types'

type MarketParticipantsQuery = ContractQuery & Required<Pick<PaginatedOptions, 'page' | 'perPage'>>
type MarketParticipantsParams = FieldsOf<MarketParticipantsQuery>
type MarketBorrowersQuery = MarketParticipantsQuery & { marketType: MarketType }

export const { useQuery: useMarketBorrowers } = queryFactory({
  queryKey: ({ blockchainId, contractAddress, page, perPage, marketType }: FieldsOf<MarketBorrowersQuery>) =>
    ({ name: 'getMarketBorrowers', blockchainId, contractAddress, page, perPage, marketType }) as const,
  queryFn: ({ blockchainId, contractAddress, marketType, page, perPage }: MarketBorrowersQuery) =>
    getMarketBorrowers(blockchainId, contractAddress, { endpoint: getMarketEndpoint(marketType), page, perPage }),

  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})

export const { useQuery: useMarketSuppliers } = queryFactory({
  queryKey: ({ blockchainId, contractAddress, page, perPage }: MarketParticipantsParams) =>
    ({ name: 'getVaultDepositors', blockchainId, contractAddress, page, perPage }) as const,
  queryFn: ({ blockchainId, contractAddress, page, perPage }: MarketParticipantsQuery) =>
    getVaultDepositors(blockchainId, contractAddress, { page, perPage }),
  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})
