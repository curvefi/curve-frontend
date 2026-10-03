import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import type { PoolParams, PoolQuery } from '@/stellar/queries/query-types'
import { poolValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei } from '@ui/lib/decimal'

export const {
  useQuery: usePoolSupply,
  fetchQuery: fetchPoolSupply,
  invalidate: invalidatePoolSupply,
} = queryFactory({
  queryKey: ({ network, pool }: PoolParams) => ({ name: 'total_supply', network, pool }),
  queryFn: async ({ network, pool }: PoolQuery) =>
    fromWei(await readContract<bigint>(network, pool, 'total_supply'), LP_TOKEN_DECIMALS),
  category: 'dex.pool',
  validationSuite: poolValidationSuite,
})
