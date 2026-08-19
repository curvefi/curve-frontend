import { Chain, MINT_CHAINS } from '@curvefi/prices-api'
import {
  getAllMarkets,
  getUserMarkets,
  getUserMarketStats,
  Market as MintMarketFromApi,
} from '@curvefi/prices-api/crvusd'
import type { Address } from '@primitives/address.utils'
import { recordEntries } from '@primitives/objects.utils'
import { type FieldsOf } from '@ui-kit/lib'
import { type ChainNameQuery, queryFactory, type UserQuery } from '@ui-kit/lib/model/query'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/evm-address-validation'
import { pricesApiChainNameValidationGroup } from '@ui-kit/lib/model/query/prices-chain-validation'
import {
  UserContractParams,
  UserContractQuery,
  userContractValidationSuite,
} from '@ui-kit/lib/model/query/user-contract'
import { createValidationSuite, EmptyValidationSuite } from '@ui-kit/lib/validation'

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
    (await getUserMarkets(userAddress, blockchainId)).map(market => market.controller),
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
