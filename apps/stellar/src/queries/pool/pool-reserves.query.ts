import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { PoolParams, PoolQuery, rootKeys } from '@/stellar/queries/root-keys'
import { poolValidationSuite } from '@/stellar/queries/validation/pool.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: usePoolReserves, invalidate: invalidatePoolReserves } = queryFactory({
  queryKey: ({ network, pool }: PoolParams) => [...rootKeys.pool({ network, pool }), 'get_balances'] as const,
  queryFn: async ({ network, pool }: PoolQuery) =>
    (await readContract<bigint[]>(network, pool, 'get_balances')).map(value => value.toString() as Decimal),
  category: 'dex.pool',
  validationSuite: poolValidationSuite,
})
