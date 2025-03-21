'use server'
import cloneDeep from 'lodash/cloneDeep'
import memoizee from 'memoizee'
import { getNetworks } from '@/dex/lib/networks'
import { getPools } from '@/dex/lib/pools'
import {
  CurveApi,
  NetworkConfig,
  PoolDataMapper,
  type PoolUrlParams,
  type ValueMapperCached,
} from '@/dex/types/main.types'

const options = { maxAge: 5 * 1000 * 60, promise: true, preFetch: true } as const

const getAllNetworks = memoizee(getNetworks, options)

/**
 * Retrieves a mapping of pool IDs and addresses to pool names.
 * Unfortunately we cannot use an API as the pool names are generated in CurveJS
 */
export const getServerSideCache = memoizee(async (network: NetworkConfig) => {
  const curveJS = cloneDeep((await import('@curvefi/api')).default) as CurveApi
  await curveJS.init('NoRPC', 'NoRPC', { chainId: network.chainId })
  await Promise.all([
    curveJS.factory.fetchPools(),
    curveJS.cryptoFactory.fetchPools(),
    curveJS.twocryptoFactory.fetchPools(),
    curveJS.crvUSDFactory.fetchPools(),
    curveJS.tricryptoFactory.fetchPools(),
    curveJS.stableNgFactory.fetchPools(),
  ])
  const { poolsMapper, poolsMapperCache } = await getPools(curveJS, curveJS.getPoolList(), network, {})
  const [tvl, volume] = await Promise.all([getTvlCache(network, poolsMapper), getVolumeCache(network, poolsMapper)])
  return { pools: poolsMapperCache, tvl, volume }
}, options)

export async function getNetworkConfig(networkName: string) {
  const networks = await getAllNetworks()
  return Object.values(networks).find((n) => n.id === networkName)
}

const getTvlCache = async (network: NetworkConfig, pools: PoolDataMapper): Promise<ValueMapperCached> =>
  Object.fromEntries(
    await Promise.all(
      Object.values(pools).map(async ({ pool }) => [
        pool.id,
        { value: network.poolCustomTVL[pool.id] || (await pool.stats.totalLiquidity()) },
      ]),
    ),
  )

const getVolumeCache = async (network: NetworkConfig, pools: PoolDataMapper) => {
  if (network.isLite) {
    return {}
  }
  const promises = Object.values(pools).map(async ({ pool }) => {
    try {
      return [pool.id, { value: await pool.stats.volume() }]
    } catch (e) {
      const logMethod = pool.id === 'crveth' ? 'log' : 'warn' // this pool is always throwing an error
      console[logMethod](e)
      return [pool.id, null]
    }
  })
  return Object.fromEntries((await Promise.all(promises)).filter(([, volume]) => volume != null))
}

export const getPoolName = async ({ network: networkName, pool: poolFromUrl }: PoolUrlParams) => {
  const network = await getNetworkConfig(networkName)
  if (!network) {
    console.warn(`Cannot find network ${network}`)
    return poolFromUrl
  }

  try {
    const { pools } = await getServerSideCache(network)
    const poolCache = poolFromUrl.startsWith('0x')
      ? Object.values(pools).find(({ pool }) => pool.address === poolFromUrl)
      : pools[poolFromUrl]
    if (poolCache) return poolCache.pool.name
    console.warn(`Cannot find pool ${poolCache} in ${networkName}. Pools: ${JSON.stringify(poolCache, null, 2)}`)
  } catch (e) {
    console.error(`Cannot retrieve pool name`, e)
  }
  return poolFromUrl
}
