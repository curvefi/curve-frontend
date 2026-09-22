import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import type { PoolParams, PoolQuery } from '@/stellar/queries/root-keys'
import { rootKeys } from '@/stellar/queries/root-keys'
import { poolValidationSuite } from '@/stellar/queries/validation/pool.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: usePoolRates, invalidate: invalidatePoolRates } = queryFactory({
  queryKey: ({ network, pool }: PoolParams) => [...rootKeys.pool({ network, pool }), 'stored_rates'] as const,
  queryFn: async ({ network, pool }: PoolQuery) =>
    (await readContract<bigint[]>(network, pool, 'stored_rates')).map(value => value.toString() as Decimal),
  category: 'dex.pool',
  validationSuite: poolValidationSuite,
})
