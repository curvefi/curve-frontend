import { log } from '@ui-kit/lib/logging'
import type { ChainQuery } from '@ui-kit/lib/model'
import { getNetworks } from '../entities/networks'
import type { CurveApi } from '../types/main.types'

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
export async function fetchPoolIds(curve: CurveApi, { chainId }: ChainQuery): Promise<string[]> {
  const { useApi } = getNetworks()[chainId]

  log(`Hydrating DEX - Fetching pool ids { useApi: ${useApi}, hasRpc: ${!curve.isNoRPC} }`)

  await Promise.all([
    curve.factory.fetchPools(useApi),
    curve.cryptoFactory.fetchPools(useApi),
    curve.twocryptoFactory.fetchPools(useApi),
    curve.crvUSDFactory.fetchPools(useApi),
    curve.tricryptoFactory.fetchPools(useApi),
    curve.stableNgFactory.fetchPools(useApi),
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
