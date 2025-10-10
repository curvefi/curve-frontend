import { FastifyBaseLogger } from 'fastify/types/logger'
import { type default as curveApi, createCurve } from '@curvefi/api'
import { resolveRpc } from './rpc/network-metadata'

export type CurveJS = typeof curveApi
type ChainId = number

const instances: Partial<Record<ChainId, Promise<CurveJS>>> = {}

const FACTORIES = [
  'factory',
  'cryptoFactory',
  'twocryptoFactory',
  'crvUSDFactory',
  'tricryptoFactory',
  'stableNgFactory',
] as const

const ONE_MINUTE = 60000

/**
 * Fetch pools from all Curve factories and set up periodic refresh for a given CurveJS instance.
 */
async function fetchPools(curve: CurveJS, log: FastifyBaseLogger) {
  const factories = FACTORIES.map((key) => curve[key])
  const fetchAllPools = async ({ initial = false }: { initial?: boolean } = {}) => {
    try {
      await Promise.all(
        factories.map(async (factory) => {
          await factory.fetchPools()
          if ('fetchNewPools' in factory) await factory.fetchNewPools()
        }),
      )
    } catch (e) {
      log.error({ message: 'Error fetching pools', error: e, chainId: curve.chainId })
      if (initial) throw e // make sure the request fails if fetching pools fails
    } finally {
      setTimeout(fetchAllPools, ONE_MINUTE).unref() // refresh every minute, unref to avoid keeping the event loop alive
    }
  }
  await fetchAllPools({ initial: true })
  log.info({ message: 'pools fetched', chainId: curve.chainId })
}

/**
 * Get a Curve.js instance for a specific chain ID, initializing it if necessary.
 * The instance is cached for future use. Automatically fetches and refreshes pool data.
 */
export const loadCurve = (chainId: number, log: FastifyBaseLogger) => {
  if (!instances[chainId]) {
    instances[chainId] = (async () => {
      const curve = createCurve()
      const { url } = await resolveRpc(chainId, curve)
      await curve.init('JsonRpc', { url }, { chainId })
      await fetchPools(curve, log)
      return curve
    })()
  }
  return instances[chainId]!
}
