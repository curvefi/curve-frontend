import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import type { PoolParams, PoolQuery } from '@/stellar/queries/query-types'
import { poolValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { queryFactory } from '@ui/features/queries/factory'

type PoolInfo = {
  coin_count: number
  coins: StellarContract[]
  coin_decimals: number[]
  factory: StellarContract
  rates: bigint[]
  min_locked_liquidity: bigint
  scales: { amplification_scale: bigint; fee_denominator: bigint; precision: bigint }
}

export const { useQuery: usePoolInfo, fetchQuery: fetchPoolInfo } = queryFactory({
  queryKey: ({ network, pool }: PoolParams) => ({ name: 'pool_info', network, pool }) as const,
  queryFn: ({ network, pool }: PoolQuery) => readContract<PoolInfo>(network, pool, 'pool_info'),
  category: 'dex.poolParams',
  validationSuite: poolValidationSuite,
})
