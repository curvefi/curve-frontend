import { FastifyBaseLogger } from 'fastify'
import { createCurve, type default as curveApi } from '@curvefi/api'
import { getPoolFilters } from '@curvefi/prices-api/chains'
import { resolveRpc } from './network-metadata'

export type CurveJS = typeof curveApi
type ChainId = number
type CurveInstance = { curve: CurveJS; blacklist: Set<string> }

const instances: Partial<Record<ChainId, Promise<CurveInstance>>> = {}

const FACTORIES = [
  'factory',
  'cryptoFactory',
  'twocryptoFactory',
  'crvUSDFactory',
  'tricryptoFactory',
  'stableNgFactory',
] as const

const ONE_MINUTE = 60000

const setsEqual = <T>(a: ReadonlySet<T>, b: ReadonlySet<T>) => a.size === b.size && [...a].every(value => b.has(value))

/**
 * Fetch pools and their blacklist, keeping the shared instance updated with periodic refreshes.
 */
async function fetchPools(instance: CurveInstance, log: FastifyBaseLogger) {
  const { curve } = instance
  const factories = FACTORIES.map(key => curve[key])
  const fetchAllPools = async ({ initial = false }: { initial?: boolean } = {}) => {
    try {
      const [poolFilters] = await Promise.all([
        getPoolFilters(),
        ...factories.map(async factory => {
          await factory.fetchPools()
          if ('fetchNewPools' in factory) await factory.fetchNewPools()
        }),
      ])

      const blacklist = poolFilters
        .filter(({ chainId }) => chainId === curve.chainId)
        .map(({ address }) => address.toLowerCase())

      const nextBlacklist = new Set(blacklist)

      // setBlacklist() drops Curve JS's memoized route graph. Only rebuild when it actually changed.
      if (!setsEqual(instance.blacklist, nextBlacklist)) {
        curve.router.setBlacklist(blacklist)
        instance.blacklist = nextBlacklist
      }
    } catch (e) {
      log.error({ message: 'Error fetching pools', error: e, chainId: curve.chainId })
      if (initial) throw e // make sure the request fails if fetching pools fails
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
      setTimeout(fetchAllPools, ONE_MINUTE).unref() // refresh every minute, unref to avoid keeping the event loop alive
    }
  }
  await fetchAllPools({ initial: true })
  log.info({ message: 'pools fetched', chainId: curve.chainId })
}

/**
 * Get a shared Curve.js instance and its latest pool blacklist, initializing them if necessary.
 * The result is cached per chain. Pool data and the blacklist refresh automatically.
 */
export const loadCurve = (chainId: number, log: FastifyBaseLogger) => {
  instances[chainId] ??= (async () => {
    const curve = createCurve()
    const { url } = await resolveRpc(chainId, curve)
    await curve.init('JsonRpc', { url }, { chainId })
    const instance: CurveInstance = { curve, blacklist: new Set() }
    await fetchPools(instance, log)
    return instance
  })()
  return instances[chainId]
}
