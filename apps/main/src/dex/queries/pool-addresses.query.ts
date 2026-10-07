import { getAddress } from 'viem'
import { getPool } from '@/dex/pool.utils'
import { requireLib, useCurve } from '@evm-ui/features/connect-wallet'
import type { ChainParams } from '@evm-ui/queries/query-types'
import { curveApiValidationSuite } from '@evm-ui/queries/validation/curve-api-validation'
import { queryFactory } from '@ui/features/queries/factory'

const { useQuery: usePoolAddressesQuery, queryKey: getPoolAddressesQueryKey } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ({ name: 'poolAddresses', chainId }) as const,
  queryFn: () => {
    const curve = requireLib('curveApi')
    return Promise.resolve(curve.getPoolList().map(poolId => getAddress(getPool(poolId, curve).address)))
  },
  validationSuite: curveApiValidationSuite,
  category: 'dex.pools',
})

export { getPoolAddressesQueryKey }

/**
 * Annoyingly, getPoolList returns pool IDs, not addresses, and getPool doesn't checksum addresses.
 * In a way this is a pools mapper and we should optimize it in the future, preferably by avoiding calling getPool.
 * Alternatively we could maybe have prices API return all pool addresses.
 */
export function usePoolAddresses(params: ChainParams, enabled = true) {
  const { curveApi, isHydrated } = useCurve()
  return usePoolAddressesQuery(params, enabled && isHydrated && curveApi?.chainId === params.chainId)
}
