import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { queryClient } from '@ui-kit/lib/api/query-client'

export type MintMarketFromApi = {
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

export const { getQueryOptions: getMintMarketOptions } = queryFactory({
  queryKey: () => ['mint-markets'] as const,
  queryFn: async () => {
    const chains = await queryClient.fetchQuery(getSupportedChainOptions({}))
    return await Promise.all(
      chains.map(async (blockchainId) => {
        const response = await fetch(`https://prices.curve.fi/v1/crvusd/markets/${blockchainId}`)
        return (await response.json()) as { chain: string; data: MintMarketFromApi[] }
      }),
    )
  },
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
