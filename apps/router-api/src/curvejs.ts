import { FastifyBaseLogger } from 'fastify/types/logger'
import { type default as curveApi, createCurve } from '@curvefi/api'
import { resolveRpc } from './rpc/network-metadata'

export type CurveJS = typeof curveApi
export type ChainId = number

const instances: { [P in ChainId]?: Promise<CurveJS> } = {}

const FACTORIES = [
  'factory',
  'cryptoFactory',
  'twocryptoFactory',
  'crvUSDFactory',
  'tricryptoFactory',
  'stableNgFactory',
] as const

async function hydrateCurve(curve: CurveJS, log: FastifyBaseLogger) {
  const factories = FACTORIES.map((key) => curve[key])
  await Promise.all(
    factories.map(async (factory) => {
      await factory.fetchPools()
      if ('fetchNewPools' in factory) await factory.fetchNewPools()
    }),
  )
  log.info({ message: 'curve client initialized', chainId: curve.chainId })
  return () => Promise.all(factories.map((factory) => 'fetchNewPools' in factory && factory.fetchNewPools()))
}

/**
 * Get a Curve.js instance for a specific chain ID, initializing it if necessary.
 * The instance is cached for future use. Also returns a function to refresh the pool data.
 */
export const loadCurve = (chainId: number, log: FastifyBaseLogger) => {
  if (!instances[chainId]) {
    instances[chainId] = (async () => {
      const curve = createCurve()
      const { url } = await resolveRpc(chainId, curve)
      await curve.init('JsonRpc', { url }, { chainId })
      const refresh = await hydrateCurve(curve, log)
      return curve
    })()
  }
  return instances[chainId]!
}
