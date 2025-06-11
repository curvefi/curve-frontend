import uniq from 'lodash/uniq'
import { getCoinPrices } from '@/loan/entities/usd-prices'
import { Chain } from '@curvefi/prices-api'
import { getAllMarkets, getAllUserMarkets, getUserMarketStats, Market } from '@curvefi/prices-api/crvusd'
import { recordEntries } from '@curvefi/prices-api/objects.util'
import { queryFactory, type UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { userAddressValidationSuite } from '@ui-kit/lib/model/query/user-address-validation'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { Address } from '@ui-kit/utils'
import { UserContractParams, UserContractQuery, userContractValidationSuite } from './user-contract'

type MintMarketFromApi = Market

export type MintMarket = MintMarketFromApi & {
  stablecoin_price: number
  chain: Chain
}

/**
 * Note: The API does not provide stablecoin prices, fetch them separately and add them to the data.
 * I requested benber86 to add stablecoin prices to the API, but it may take some time.
 */
async function addStableCoinPrices({ chain, data }: { chain: Chain; data: MintMarketFromApi[] }) {
  const stablecoinAddresses = uniq(data.map((market) => market.stablecoinToken.address))
  const stablecoinPrices = await getCoinPrices(stablecoinAddresses, chain)
  return data.map((market) => ({
    ...market,
    chain,
    stablecoin_price: stablecoinPrices[market.stablecoinToken.address],
  }))
}

export const {
  getQueryOptions: getMintMarketOptions,
  invalidate: invalidateMintMarkets,
  fetchQuery: fetchMintMarkets,
  setQueryData: setMintMarkets,
} = queryFactory({
  queryKey: () => ['mint-markets', 'v1'] as const,
  queryFn: async (): Promise<MintMarket[]> => {
    const results = await Promise.all(
      Object.entries(await getAllMarkets()).flatMap(([blockchainId, data]) =>
        addStableCoinPrices({ chain: blockchainId as Chain, data }),
      ),
    )
    return results.flat()
  },
  validationSuite: EmptyValidationSuite,
})

const {
  getQueryOptions: getUserMintMarketsQueryOptions,
  getQueryData: getCurrentUserMintMarkets,
  invalidate: invalidateUserMintMarkets,
} = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-mint-markets', { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress }: UserQuery) =>
    Object.fromEntries(
      Object.entries(await getAllUserMarkets(userAddress)).map(([chain, userMarkets]) => [
        chain,
        userMarkets.map((market) => market.controller),
      ]),
    ) as Record<Chain, Address[]>,
  validationSuite: userAddressValidationSuite,
})

export const getUserMintMarketsOptions = getUserMintMarketsQueryOptions

const { useQuery: useUserMintMarketStatsQuery, invalidate: invalidateUserMintMarketStats } = queryFactory({
  queryKey: ({ userAddress, blockchainId, contractAddress }: UserContractParams) =>
    ['user-mint-markets', 'stats', { blockchainId }, { contractAddress }, { userAddress }, 'v1'] as const,
  queryFn: ({ userAddress, blockchainId, contractAddress }: UserContractQuery) =>
    getUserMarketStats(userAddress, blockchainId, contractAddress),
  validationSuite: userContractValidationSuite,
})

export const invalidateAllUserMintMarkets = (userAddress: Address | undefined) => {
  invalidateUserMintMarkets({ userAddress })
  recordEntries(getCurrentUserMintMarkets({ userAddress }) ?? {}).forEach(([blockchainId, contracts]) =>
    contracts.forEach((contractAddress) =>
      invalidateUserMintMarketStats({
        userAddress,
        blockchainId,
        contractAddress,
      }),
    ),
  )
}

export const useUserMintMarketStats = useUserMintMarketStatsQuery
