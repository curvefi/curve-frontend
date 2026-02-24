import { Chain } from '@curvefi/prices-api'
import {
  getAllMarkets,
  getAllUserMarkets,
  getUserMarketStats,
  Market as MintMarketFromApi,
} from '@curvefi/prices-api/crvusd'
import { mapRecord, recordEntries } from '@curvefi/primitives/objects.utils'
import { queryFactory, type UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { userAddressValidationSuite } from '@ui-kit/lib/model/query/user-address-validation'
import {
  UserContractParams,
  UserContractQuery,
  userContractValidationSuite,
} from '@ui-kit/lib/model/query/user-contract'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { Address } from '@ui-kit/utils'

export type MintMarket = MintMarketFromApi & {
  chain: Chain
}

export const { getQueryOptions: getMintMarketOptions, invalidate: invalidateMintMarkets } = queryFactory({
  queryKey: () => ['mint-markets', 'v2'] as const,
  queryFn: async (): Promise<MintMarket[]> =>
    recordEntries(await getAllMarkets()).flatMap(([chain, markets]) => markets.map((market) => ({ ...market, chain }))),
  validationSuite: EmptyValidationSuite,
})

const {
  getQueryOptions: getUserMintMarketsQueryOptions,
  getQueryData: getCurrentUserMintMarkets,
  invalidate: invalidateUserMintMarkets,
} = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-mint-markets', { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress }: UserQuery): Promise<Record<Chain, Address[]>> =>
    mapRecord(await getAllUserMarkets(userAddress), (_, userMarkets) => userMarkets.map((market) => market.controller)),
  validationSuite: userAddressValidationSuite,
})

export const getUserMintMarketsOptions = getUserMintMarketsQueryOptions

const {
  getQueryOptions: getUserMintMarketStatsQueryOptions,
  useQuery: useUserMintMarketStatsQuery,
  invalidate: invalidateUserMintMarketStats,
} = queryFactory({
  queryKey: ({ userAddress, blockchainId, contractAddress }: UserContractParams) =>
    ['user-mint-markets', 'stats', { blockchainId }, { contractAddress }, { userAddress }, 'v1'] as const,
  queryFn: ({ userAddress, blockchainId, contractAddress }: UserContractQuery) =>
    getUserMarketStats(userAddress, blockchainId, contractAddress),
  validationSuite: userContractValidationSuite,
})

export const invalidateAllUserMintMarkets = async (userAddress: Address | null | undefined) => {
  await invalidateUserMintMarkets({ userAddress })

  const invalidateContracts = recordEntries(getCurrentUserMintMarkets({ userAddress }) ?? {}).flatMap(
    ([blockchainId, contracts]) =>
      contracts.map((contractAddress) =>
        invalidateUserMintMarketStats({
          userAddress,
          blockchainId,
          contractAddress,
        }),
      ),
  )
  await Promise.all(invalidateContracts)
}

export const useUserMintMarketStats = useUserMintMarketStatsQuery
export const getUserMintMarketsStatsOptions = getUserMintMarketStatsQueryOptions
