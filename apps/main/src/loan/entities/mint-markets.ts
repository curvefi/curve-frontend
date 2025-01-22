import { queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { memoize } from 'lodash'

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

// todo: move to a separate query
const getSupportedChains = memoize(async () => {
  const response = await fetch(`https://prices.curve.fi/v1/chains`)
  const { data } = (await response.json()) as { data: { name: string }[] }
  return data.map((chain) => chain.name)
})

export const { getQueryOptions: getMintMarketOptions } = queryFactory({
  queryKey: () => ['mint-markets'] as const,
  queryFn: async () => {
    const chains = await getSupportedChains()
    return await Promise.all(
      chains.map(async (blockchainId) => {
        const response = await fetch(`https://prices.curve.fi/v1/crvusd/markets/${blockchainId}`)
        return (await response.json()) as { chain: string; data: MintMarketFromApi[] }
      }),
    )
  },
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}), // no arguments to validate
})
