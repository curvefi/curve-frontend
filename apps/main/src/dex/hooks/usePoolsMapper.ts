import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { type CurveApi, useCurve } from '@evm-ui/features/connect-wallet'
import { fromEntries } from '@primitives/objects.utils'

export type PoolsMapper = Record<string, PoolTemplate>

const EMPTY_POOLS_MAPPER: PoolsMapper = {}
const cache = new WeakMap<CurveApi, PoolsMapper>()

export const invalidatePoolsMapper = (curve: CurveApi) => cache.delete(curve)

/**
 * Shared pools mapper that persists across page navigations.
 * Still, very unperformant and requires hydration of curve-js,
 * so will need to be refactored away with Prices API in the future.
 */
export function usePoolsMapper() {
  const { curveApi, isHydrated } = useCurve()
  if (!curveApi || !isHydrated) return EMPTY_POOLS_MAPPER

  const cached = cache.get(curveApi)
  if (cached) return cached

  const mapper = fromEntries(curveApi.getPoolList().map(poolId => [poolId, curveApi.getPool(poolId)]))
  cache.set(curveApi, mapper)
  return mapper
}
