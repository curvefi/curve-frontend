import { readContract } from '@/features/connect-wallet/stellar-wallet-kit'
import { rootKeys } from '@/queries/root-keys'
import { poolValidationSuite, type PoolQuery, type PoolParams } from '@/queries/validation/deposit.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: usePoolReserves, invalidate: invalidatePoolReserves } = queryFactory({
  queryKey: ({ network, pool }: PoolParams) => [...rootKeys.pool({ network, pool }), 'get_balances'] as const,
  queryFn: async ({ network, pool }: PoolQuery) =>
    (await readContract<bigint[]>(network, pool, 'get_balances')).map(value => value.toString() as Decimal),
  category: 'dex.pool',
  validationSuite: poolValidationSuite,
})
