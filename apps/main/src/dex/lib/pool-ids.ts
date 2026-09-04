import { log } from '@ui/lib/logging'
import type { CurveApi } from '../types/main.types'

const USE_API = true

/**
 * Hydrates the passed `curve` instance with all DEX pool registries and returns the
 * resulting pool ids from that same instance.
 *
 * Why this exists:
 * The previous implementation used a React Query helper that resolved `requireLib('curveApi')`
 * inside the query function. During overlapping hydrations that could read a newer singleton
 * instance than the `curveApi` passed into DEX hydration, which made pool bootstrap depend on
 * two different curve instances. This helper keeps the whole bootstrap flow instance-local.
 *
 * The pool ids are intentionally returned before app-level blacklist filtering. The blacklist
 * depends on pool addresses, so we still apply it later while building `poolsMapper`.
 */
export async function fetchPoolIds(curve: CurveApi): Promise<string[]> {
  log(`Hydrating DEX - Fetching pool ids { hasRpc: ${!curve.isNoRPC} }`)

  await Promise.all([
    curve.factory.fetchPools(USE_API),
    curve.cryptoFactory.fetchPools(USE_API),
    curve.twocryptoFactory.fetchPools(USE_API),
    curve.crvUSDFactory.fetchPools(USE_API),
    curve.tricryptoFactory.fetchPools(USE_API),
    curve.stableNgFactory.fetchPools(USE_API),
  ])

  if (!curve.isNoRPC) {
    await Promise.all([
      curve.factory.fetchNewPools(),
      curve.cryptoFactory.fetchNewPools(),
      curve.twocryptoFactory.fetchNewPools(),
      curve.tricryptoFactory.fetchNewPools(),
      curve.stableNgFactory.fetchNewPools(),
    ])
  }

  return curve.getPoolList()
}
