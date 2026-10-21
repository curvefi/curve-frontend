import { test } from 'vest'
import { fetchNewPools } from '@/dex/lib/curvejs'
import { tryGetPool } from '@/dex/pool.utils'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { ChainParams } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import type { Nullish } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { queryClient } from '@ui/features/queries/query-client'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'

type PoolLookupParams = ChainParams & { poolIdOrAddress: Nullish | string }

const NAME = 'pool.lookup'

/** Niche lookup for PagePool's URL resolution where pool can either by id or address; other consumers should use dedicated pool queries or the pool context. */
export const { useQuery: usePoolLookup } = queryFactory({
  queryKey: ({ chainId, poolIdOrAddress }: PoolLookupParams) => ({ name: NAME, chainId, poolIdOrAddress }) as const,
  queryFn: async ({ poolIdOrAddress }: { poolIdOrAddress: string }) => {
    const curveApi = requireLib('curveApi')
    const pool = tryGetPool(poolIdOrAddress, curveApi)
    if (pool) return pool

    try {
      await fetchNewPools(curveApi)
      return tryGetPool(poolIdOrAddress, curveApi) ?? null
    } catch {
      return null
    }
  },
  validationSuite: createValidationSuite(({ chainId, poolIdOrAddress }: PoolLookupParams) => {
    chainValidationGroup({ chainId })
    curveApiValidationGroup({ chainId })
    test('poolIdOrAddress', () => {
      enforce(poolIdOrAddress).message('Pool ID or address is required').isNotEmpty()
    })
  }),
  category: 'global.no-persist',
  disableLog: true, // Pool instances have circular references that cannot be serialized by the query logger used in Cypress.
})

// We don't use the invalidate provided by queryFactory as that's for one specific pool only.
// We want to invalidate all, as a user might have navigated between pools and have more than one in the TanStack cache linked to an old one curve-js instance.
export const invalidatePoolLookups = () => queryClient.invalidateQueries({ queryKey: [{ name: NAME }] })
