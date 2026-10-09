import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import type { PoolDecimalsParams, PoolDecimalsQuery } from '@/stellar/queries/query-types'
import { poolDecimalsValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { zip } from '@primitives/array.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei } from '@ui/lib/decimal'

/** Pool reserves in decimal token amounts, in pool token order. */
export const { useQuery: usePoolReserves, invalidate: invalidatePoolReserves } = queryFactory({
  queryKey: ({ network, pool, decimals }: PoolDecimalsParams) =>
    ({ name: 'get_balances', network, pool, decimals }) as const,
  queryFn: async ({ network, pool, decimals }: PoolDecimalsQuery) =>
    zip(await readContract<bigint[]>(network, pool, 'get_balances'), decimals).map(([value, d]) => fromWei(value, d)),
  category: 'dex.pool',
  validationSuite: poolDecimalsValidationSuite,
})
