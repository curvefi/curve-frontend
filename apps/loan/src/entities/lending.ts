import { ContractParams, ContractQuery, PoolParams, PoolQuery, queryFactory, rootKeys } from '@/shared/model/query'
import { poolValidationSuite } from '@/shared/model/query/pool-validation'
import { contractValidationSuite } from '@/shared/model/query/contract-validation'

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

type LendingSnapshotsFromApi = {
  chain: string,
  market_id: number,
  data: LendingSnapshotFromApi[]
}

export const _getLendingSnapshots = async ({ blockchainId, contractAddress }: ContractQuery): Promise<LendingSnapshotsFromApi> => {
  const url = `https://prices.curve.fi/v1/lending/markets/${blockchainId}/${contractAddress}/snapshots`
  const response = await fetch(url)
  const { data } = (await response.json()) as { data: LendingSnapshotsFromApi }
  if (!data) {
    throw new Error('Failed to fetch lending snapshots')
  }
  return data
}

export const { useQuery: useLendingSnapshots } = queryFactory({
  queryKey: (params: ContractParams) => [...rootKeys.contract(params), 'lendingSnapshots'] as const,
  queryFn: _getLendingSnapshots,
  staleTime: '1d',
  validationSuite: contractValidationSuite,
})
