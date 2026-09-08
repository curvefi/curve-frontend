import { Chain, MINT_CHAINS } from '@curvefi/prices-api'
import {
  getAllMarkets,
  getUserMarkets,
  getUserMarketStats,
  Market as MintMarketFromApi,
  USER_MARKETS_DEFAULT_PER_PAGE,
  USER_MARKETS_FIRST_PAGE,
} from '@curvefi/prices-api/crvusd'
import { paginate } from '@curvefi/prices-api/paginate'
import { type FieldsOf } from '@evm-ui/lib'
import { type ChainNameQuery, queryFactory, type UserQuery } from '@evm-ui/lib/model/query'
import { userAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { pricesApiChainNameValidationGroup } from '@evm-ui/lib/model/query/prices-chain-validation'
import {
  UserContractParams,
  UserContractQuery,
  userContractValidationSuite,
} from '@evm-ui/lib/model/query/user-contract'
import { createValidationSuite, EmptyValidationSuite } from '@evm-ui/lib/validation'
import type { Address } from '@primitives/address.utils'
import { recordEntries } from '@primitives/objects.utils'

type UserChainNameQuery = UserQuery & ChainNameQuery
type UserChainNameParams = FieldsOf<UserChainNameQuery>

const userChainNameValidationSuite = createValidationSuite((params: UserChainNameParams) => {
  userAddressValidationGroup(params)
  pricesApiChainNameValidationGroup(params)
})

export type MintMarket = MintMarketFromApi & {
  chain: Chain
}

export const { getQueryOptions: getMintMarketOptions, reset: resetMintMarkets } = queryFactory({
  queryKey: () => ['mint-markets', 'v4'] as const,
  queryFn: async (): Promise<MintMarket[]> =>
    recordEntries(await getAllMarkets()).flatMap(([chain, markets]) => markets.map(market => ({ ...market, chain }))),
  category: 'llamalend.marketList',
  validationSuite: EmptyValidationSuite,
})

const {
  getQueryOptions: getUserMintMarketsQueryOptions,
  getQueryData: getCurrentUserMintMarkets,
  invalidate: invalidateUserMintMarketsQuery,
  reset: resetUserMintMarketsQuery,
} = queryFactory({
  queryKey: ({ userAddress, blockchainId }: UserChainNameParams) =>
    ['user-mint-markets', { blockchainId }, { userAddress }, 'v2'] as const,
  queryFn: async ({ userAddress, blockchainId }: UserChainNameQuery): Promise<Address[]> =>
    (
      await paginate(
        page => getUserMarkets(userAddress, blockchainId, { page }),
        USER_MARKETS_FIRST_PAGE,
        USER_MARKETS_DEFAULT_PER_PAGE,
      )
    ).map(market => market.controller),
  category: 'llamalend.user',
  validationSuite: userChainNameValidationSuite,
})

export const getUserMintMarketsOptions = getUserMintMarketsQueryOptions

const {
  getQueryOptions: getUserMintMarketStatsQueryOptions,
  useQuery: useUserMintMarketStatsQuery,
  invalidate: invalidateUserMintMarketStats,
  reset: resetUserMintMarketStats,
} = queryFactory({
  queryKey: ({ userAddress, blockchainId, contractAddress }: UserContractParams) =>
    ['user-mint-markets', 'stats', { blockchainId }, { contractAddress }, { userAddress }, 'v1'] as const,
  queryFn: ({ userAddress, blockchainId, contractAddress }: UserContractQuery) =>
    getUserMarketStats(userAddress, blockchainId, contractAddress),
  category: 'llamalend.user',
  validationSuite: userContractValidationSuite,
})

export const invalidateAllUserMintMarkets = async (userAddress: Address | null | undefined) => {
  await Promise.all(MINT_CHAINS.map(blockchainId => invalidateUserMintMarketsQuery({ userAddress, blockchainId })))

  const invalidateContracts = MINT_CHAINS.flatMap(blockchainId =>
    (getCurrentUserMintMarkets({ userAddress, blockchainId }) ?? []).map(contractAddress =>
      invalidateUserMintMarketStats({
        userAddress,
        blockchainId,
        contractAddress,
      }),
    ),
  )
  await Promise.all(invalidateContracts)
}

export const resetAllUserMintMarkets = async (userAddress: Address | null | undefined) => {
  await Promise.all(MINT_CHAINS.map(blockchainId => resetUserMintMarketsQuery({ userAddress, blockchainId })))

  const resetContracts = MINT_CHAINS.flatMap(blockchainId =>
    (getCurrentUserMintMarkets({ userAddress, blockchainId }) ?? []).map(contractAddress =>
      resetUserMintMarketStats({
        userAddress,
        blockchainId,
        contractAddress,
      }),
    ),
  )
  await Promise.all(resetContracts)
}

export const useUserMintMarketStats = useUserMintMarketStatsQuery
export const getUserMintMarketsStatsOptions = getUserMintMarketStatsQueryOptions
