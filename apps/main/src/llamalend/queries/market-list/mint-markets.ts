import { Chain } from '@curvefi/prices-api'
import {
  getAllMarkets,
  getAllUserMarkets,
  getUserMarketStats,
  Market as MintMarketFromApi,
} from '@curvefi/prices-api/crvusd'
import { queryFactory, type UserParams, type UserQuery } from '@evm-ui/lib/model/query'
import { userAddressValidationSuite } from '@evm-ui/lib/model/query/evm-address-validation'
import {
  UserContractParams,
  UserContractQuery,
  userContractValidationSuite,
} from '@evm-ui/lib/model/query/user-contract'
import { EmptyValidationSuite } from '@evm-ui/lib/validation'
import type { Address } from '@primitives/address.utils'
import { mapRecord, recordEntries } from '@primitives/objects.utils'

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
  invalidate: invalidateUserMintMarkets,
  reset: resetUserMintMarkets,
} = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-mint-markets', { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress }: UserQuery): Promise<Record<Chain, Address[]>> =>
    mapRecord(await getAllUserMarkets(userAddress), (_, userMarkets) => userMarkets.map(market => market.controller)),
  category: 'llamalend.user',
  validationSuite: userAddressValidationSuite,
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
  await invalidateUserMintMarkets({ userAddress })

  const invalidateContracts = recordEntries(getCurrentUserMintMarkets({ userAddress }) ?? {}).flatMap(
    ([blockchainId, contracts]) =>
      contracts.map(contractAddress =>
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
  await resetUserMintMarkets({ userAddress })

  const resetContracts = recordEntries(getCurrentUserMintMarkets({ userAddress }) ?? {}).flatMap(
    ([blockchainId, contracts]) =>
      contracts.map(contractAddress =>
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
