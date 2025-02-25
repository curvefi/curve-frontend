import { queryFactory, type UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import uniq from 'lodash/uniq'
import { getCoinPrices } from '@/loan/entities/usd-prices'
import type { UserMarketStats } from '@curvefi/prices-api/crvusd'
import { getMarkets, getUserMarkets, getUserMarketStats, Market } from '@curvefi/prices-api/crvusd'
import { Chain } from '@curvefi/prices-api'
import { getSupportedChains } from '@/loan/entities/chains'
import { userValidationSuite } from '@ui-kit/lib/model/query/user-validation'
import { Address } from '@ui-kit/utils'

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
        const data = await getMarkets(chain, {})
        return await addStableCoinPrices({ chain, data })
      }),
    )
    return allMarkets.flat()
  },
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})

export type UserMintMarket = UserMarketStats & { chain: Chain }

export const { getQueryOptions: getUserMintMarketsOptions, invalidate: invalidateUserMintMarkets } = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-mint-markets', { userAddress }, 'v1'] as const,
  queryFn: async ({ userAddress }: UserQuery): Promise<Record<Address, UserMintMarket>> => {
    const chains = await getSupportedChains()
    const markets = await Promise.all(
      chains.map(async (chain) => {
        const markets = await getUserMarkets(userAddress, chain, {})
        return Promise.all(
          markets.map(async ({ controller }) => [
            controller,
            { chain, ...(await getUserMarketStats(userAddress, chain, controller)) },
          ]),
        )
      }),
    )
    return Object.fromEntries(markets.flat())
  },
  staleTime: '5m',
  validationSuite: userValidationSuite,
})
