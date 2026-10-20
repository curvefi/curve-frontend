import { fetchNewPools } from '@/dex/lib/curvejs'
import { tryGetPool } from '@/dex/pool.utils'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { hydratedQueryFactory } from '@evm-ui/hooks/useHydratedQuery'
import type { PoolParams, PoolQuery } from '@evm-ui/queries/query-types'
import { poolValidationSuite } from '@evm-ui/queries/validation/pool-validation'
import { queryClient } from '@ui/features/queries/query-client'

const NAME = 'pool.lookup'

/** Niche lookup for PagePool, where the pool address comes from the URL and could be new (such that we need to refetch); other consumers should use dedicated pool queries or the pool context. */
export const { useQuery: usePoolLookup } = hydratedQueryFactory({
  queryKey: ({ chainId, poolAddress }: PoolParams) => ({ name: NAME, chainId, poolAddress }) as const,
  queryFn: async ({ poolAddress }: PoolQuery) => {
    const curveApi = requireLib('curveApi')
    const pool = tryGetPool(poolAddress, curveApi)
    if (pool) return pool

    try {
      await fetchNewPools(curveApi)
      return tryGetPool(poolAddress, curveApi) ?? null
    } catch {
      return null
    }
  },
  validationSuite: poolValidationSuite,
  category: 'global.no-persist',
  disableLog: true, // Pool instances have circular references that cannot be serialized by the query logger used in Cypress.
})

// We don't use the invalidate provided by queryFactory as that's for one specific pool only.
// We want to invalidate all, as a user might have navigated between pools and have more than one in the TanStack cache linked to an old one curve-js instance.
export const invalidatePoolLookups = () => queryClient.invalidateQueries({ queryKey: [{ name: NAME }] })
