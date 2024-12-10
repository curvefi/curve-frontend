import { PoolParams, PoolQuery, queryFactory, rootKeys } from '@/shared/model/query'
import { poolValidationSuite } from '@/shared/model/query/pool-validation'

type CrvUsdSnapshotFromApi = {
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

type CrvUsdSnapshotsFromApi = {
  chain: string,
  market_id: number,
  data: CrvUsdSnapshotFromApi[]
}

export const _getCrvUsdSnapshots = async ({ chainId, poolId }: PoolQuery): Promise<CrvUsdSnapshotsFromApi> => {
  const url = `https://prices.curve.fi/v1/crvusd/markets/${chainId}/${poolId}/snapshots`
  const response = await fetch(url)
  const { data } = (await response.json()) as { data?: CrvUsdSnapshotsFromApi }
  if (!data) {
    throw new Error('Failed to fetch crvUSD snapshots')
  }
  return data
}

export const { useQuery: useCrvUsdSnapshots } = queryFactory({
  queryKey: (params: PoolParams) => [...rootKeys.pool(params), 'crvUsdSnapshots'] as const,
  queryFn: _getCrvUsdSnapshots,
  staleTime: '1d',
  validationSuite: poolValidationSuite,
})
