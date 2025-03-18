import uniq from 'lodash/uniq'
import { getSupportedChains } from '@/loan/entities/chains'
import { getCoinPrices } from '@/loan/entities/usd-prices'
import { Chain } from '@curvefi/prices-api'
import { getMarkets, getUserMarkets, getUserMarketStats, Market } from '@curvefi/prices-api/crvusd'
import { queryFactory, type UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { userValidationSuite } from '@ui-kit/lib/model/query/user-validation'
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

export const { getQueryOptions: getMintMarketOptions, invalidate: invalidateMintMarkets } = queryFactory({
  queryKey: () => ['mint-markets', 'v1'] as const,
  queryFn: async () => {
    const chains = await getSupportedChains()
    const allMarkets = await Promise.all(
      // todo: create separate query for the loop, so it can be cached separately
      chains.map(async (blockchainId) => {
        const chain = blockchainId as Chain
        const data = await getMarkets(chain)
        return await addStableCoinPrices({ chain, data })
      }),
    )
    return allMarkets.flat()
  },
  validationSuite: EmptyValidationSuite,
})

const {
  getQueryOptions: getUserMintMarketsQueryOptions,
  getQueryData: getCurrentUserMintMarkets,
  invalidate: invalidateUserMintMarkets,
} = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-mint-markets', { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress }: UserQuery) => {
    const chains = await getSupportedChains()
    const markets = await Promise.all(
      chains.map(async (chain) => {
        const markets = await getUserMarkets(userAddress, chain, {})
        return [chain, markets.map((market) => market.controller)] as const
      }),
    )
    return Object.fromEntries(markets) as Record<Chain, Address[]>
  },
  validationSuite: userValidationSuite,
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
  const markets = Object.entries(getCurrentUserMintMarkets({ userAddress }) ?? {}) as [Chain, Address[]][]
  markets.forEach(([blockchainId, contracts]) =>
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
