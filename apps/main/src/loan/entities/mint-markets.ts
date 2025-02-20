import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import uniq from 'lodash/uniq'
import { getCoinPrices } from '@/loan/entities/usd-prices'
import { getMarkets, Market } from '@curvefi/prices-api/crvusd'
import { Chain } from '@curvefi/prices-api'
import { fetchSupportedChains } from '@ui-kit/entities/chains'

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
    const chains = await fetchSupportedChains({})
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
