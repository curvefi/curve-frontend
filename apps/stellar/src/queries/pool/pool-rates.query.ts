import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import type { PoolDecimalsParams, PoolDecimalsQuery } from '@/stellar/queries/query-types'
import { poolDecimalsValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { zip } from '@primitives/array.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei } from '@ui/lib/decimal'

// Stored rates multiply raw token amounts into values with 36 decimals.
const RATE_DECIMALS = 36

/** Rate per whole token, normalized for use with decimal token amounts. */
export const { useQuery: usePoolRates, invalidate: invalidatePoolRates } = queryFactory({
  queryKey: ({ network, pool, decimals }: PoolDecimalsParams) =>
    ({ name: 'stored_rates', network, pool, decimals }) as const,
  queryFn: async ({ network, pool, decimals }: PoolDecimalsQuery) =>
    zip(await readContract<bigint[]>(network, pool, 'stored_rates'), decimals).map(([value, decimals]) =>
      fromWei(value, RATE_DECIMALS - decimals),
    ),
  category: 'dex.pool',
  validationSuite: poolDecimalsValidationSuite,
})
