import { ContractParams, ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { EmptyValidationSuite } from '@ui-kit/lib'

type LendingSnapshotFromApi = {
  rate: number
  borrow_apy: number
  lend_apy: number
  liquidation_discount: number
  loan_discount: number
  n_loans: number
  price_oracle: number
  amm_price: number
  base_price: number
  total_debt: number
  total_assets: number
  total_debt_usd: number
  total_assets_usd: number
  minted: number
  redeemed: number
  minted_usd: number
  redeemed_usd: number
  min_band: number
  max_band: number
  collateral_balance: number
  borrowed_balance: number
  collateral_balance_usd: number
  borrowed_balance_usd: number
  sum_debt_squared: number
  timestamp: string
}

export type LendingSnapshot = LendingSnapshotFromApi

type LendingSnapshotsFromApi = {
  chain: string
  market_id: number
  data: LendingSnapshot[]
}

export const { getQueryOptions: getSupportedChainOptions } = queryFactory({
  queryKey: () => ['lending-snapshots', 'supported-chains'] as const,
  queryFn: async () => {
    const response = await fetch(`https://prices.curve.fi/v1/lending/chains`)
    const { data } = (await response.json()) as { data: string[] }
    return data
  },
  staleTime: '1d',
  validationSuite: EmptyValidationSuite,
})

export const { useQuery: useLendingSnapshots } = queryFactory({
  queryKey: (params: ContractParams) => [...rootKeys.contract(params), 'lendingSnapshots'] as const,
  queryFn: async ({ blockchainId, contractAddress }: ContractQuery): Promise<LendingSnapshot[]> => {
    const chains = await queryClient.fetchQuery(getSupportedChainOptions({}))
    if (!chains.includes(blockchainId)) return [] // backend gives 404 for optimism

    const url = `https://prices.curve.fi/v1/lending/markets/${blockchainId}/${contractAddress}/snapshots?agg=none`
    const response = await fetch(url)
    const { data } = (await response.json()) as LendingSnapshotsFromApi
    if (!data) {
      throw new Error('Failed to fetch lending snapshots')
    }
    return data.reverse() // todo: pass &sort_by=DATE_ASC&start=${start} and remove reverse - backend is timing out
  },
  staleTime: '1h',
  validationSuite: contractValidationSuite,
})
