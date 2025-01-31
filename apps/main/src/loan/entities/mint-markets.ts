import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { queryClient } from '@ui-kit/lib/api/query-client'
import uniq from 'lodash/uniq'
import { getCoinPrices } from '@/loan/entities/usd-prices'

type MintMarketFromApi = {
  address: string
  factory_address: string
  llamma: string
  rate: number
  total_debt: number
  n_loans: number
  debt_ceiling: number
  borrowable: number
  pending_fees: number
  collected_fees: number
  collateral_amount: number
  collateral_amount_usd: number
  stablecoin_amount: number
  collateral_token: {
    symbol: string
    address: string
  }
  stablecoin_token: {
    symbol: string
    address: string
  }
}

export type MintMarket = MintMarketFromApi & {
  stablecoin_price: number
}

export const { getQueryOptions: getSupportedChainOptions } = queryFactory({
  queryKey: () => ['mint-markets', 'supported-chains'] as const,
  queryFn: async () => {
    const response = await fetch(`https://prices.curve.fi/v1/chains`)
    const { data } = (await response.json()) as { data: { name: string }[] }
    return data.map((chain) => chain.name)
  },
  staleTime: '1d',
  validationSuite: EmptyValidationSuite,
})

/**
 * Note: The API does not provide stablecoin prices, fetch them separately and add them to the data.
 * I requested benber86 to add stablecoin prices to the API, but it may take some time.
 */
async function addStableCoinPrices({ chain, data }: { chain: string; data: MintMarketFromApi[] }) {
  const stablecoinAddresses = uniq(data.map((market) => market.stablecoin_token.address))
  const stablecoinPrices = await getCoinPrices(stablecoinAddresses, chain)
  return {
    chain,
    data: data.map((market) => ({
      ...market,
      stablecoin_price: stablecoinPrices[market.stablecoin_token.address],
    })),
  }
}

export const { getQueryOptions: getMintMarketOptions } = queryFactory({
  queryKey: () => ['mint-markets'] as const,
  queryFn: async () => {
    const chains = await queryClient.fetchQuery(getSupportedChainOptions({}))
    return await Promise.all(
      chains.map(async (blockchainId) => {
        const response = await fetch(`https://prices.curve.fi/v1/crvusd/markets/${blockchainId}`)
        const data = (await response.json()) as { chain: string; data: MintMarketFromApi[] }
        return await addStableCoinPrices(data)
      }),
    )
  },
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
