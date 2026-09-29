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

export const { useQuery: useMarketBorrowers } = queryFactory({
  queryKey: ({ blockchainId, contractAddress, page, perPage, marketType }: FieldsOf<MarketBorrowersQuery>) => ({
    ...rootKeys.contract({ blockchainId, contractAddress }),
    name: 'getMarketBorrowers',
    page,
    perPage,
    marketType,
  }),
  queryFn: ({ blockchainId, contractAddress, marketType, page, perPage }: MarketBorrowersQuery) =>
    getMarketBorrowers(blockchainId, contractAddress, { endpoint: getMarketEndpoint(marketType), page, perPage }),

  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})

export const { useQuery: useMarketSuppliers } = queryFactory({
  queryKey: ({ blockchainId, contractAddress, page, perPage }: MarketParticipantsParams) => ({
    ...rootKeys.contract({ blockchainId, contractAddress }),
    name: 'getVaultDepositors',
    page,
    perPage,
  }),
  queryFn: ({ blockchainId, contractAddress, page, perPage }: MarketParticipantsQuery) =>
    getVaultDepositors(blockchainId, contractAddress, { page, perPage }),
  category: 'llamalend.market',
  validationSuite: contractValidationSuite,
})
