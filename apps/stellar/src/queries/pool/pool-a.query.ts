import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import type { PoolParams, PoolQuery } from '@/stellar/queries/root-keys'
import { rootKeys } from '@/stellar/queries/root-keys'
import { poolValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { queryFactory } from '@ui/features/queries/factory'

/** Current human-scale amplification, including any active ramp. */
export const { useQuery: usePoolA, invalidate: invalidatePoolA } = queryFactory({
  queryKey: ({ network, pool }: PoolParams) => [...rootKeys.pool({ network, pool }), 'a'] as const,
  queryFn: async ({ network, pool }: PoolQuery) => Number(await readContract<bigint>(network, pool, 'a')),
  category: 'dex.pool',
  validationSuite: poolValidationSuite,
})
