'use server'
import memoizee from 'memoizee'
import curveJS from '@curvefi/api'
import { NetworkConfig, type PoolUrlParams } from '@/dex/types/main.types'
import { getNetworks } from '@/dex/lib/networks'

const options = { maxAge: 5 * 1000 * 60, promise: true, preFetch: true } as const

const getAllNetworks = memoizee(getNetworks, options)

/**
 * Retrieves a mapping of pool IDs and addresses to pool names.
 * Unfortunately we cannot use an API as the pool names are generated in CurveJS
 */
const getPoolNames = memoizee(async (config: NetworkConfig): Promise<Record<string, string>> => {
  await curveJS.init('NoRPC', 'NoRPC', { chainId: config.chainId })
  await Promise.all([
    curveJS.factory.fetchPools(),
    curveJS.cryptoFactory.fetchPools(),
    curveJS.twocryptoFactory.fetchPools(),
    curveJS.crvUSDFactory.fetchPools(),
    curveJS.tricryptoFactory.fetchPools(),
    curveJS.stableNgFactory.fetchPools(),
  ])
  return Object.fromEntries(
    curveJS
      .getPoolList()
      .map(curveJS.getPool)
      .flatMap(({ address, name, id }) => [
        [id, name],
        [address, name],
      ]),
  )
}, options)

export const getPoolName = async ({ network, pool }: PoolUrlParams) => {
  const networks = await getAllNetworks()
  const networkConfig = Object.values(networks).find((n) => n.id === network)
  if (!networkConfig) {
    console.warn(`Cannot find network ${networkConfig}`)
    return pool
  }

  try {
    const poolNames = await getPoolNames(networkConfig)
    const poolName = poolNames[pool]
    if (poolName) return poolName
    console.warn(`Cannot find pool ${pool} in ${network}. Pools: ${JSON.stringify(poolName, null, 2)}`)
  } catch (e) {
    console.error(`Cannot retrieve pool name`, e)
  }
  return pool
}
