import cloneDeep from 'lodash/cloneDeep'
import { getAllNetworks } from '@/app/dex/[network]/pools.util'
import { refreshDataInBackground } from '@/background'
import { getPools } from '@/dex/lib/pools'
import { CurveApi, NetworkConfig, PoolDataMapper, type ValueMapperCached } from '@/dex/types/main.types'
import type { DexServerSideNetworkCache } from '../types'

const DexServerSideCache: Record<string, DexServerSideNetworkCache> = {}

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
      const logMethod = pool.id === 'crveth' ? 'info' : 'warn' // this pool is always throwing an error
      // eslint-disable-next-line no-console -- false positive
      console[logMethod](e)
      return [pool.id, null]
    }
  })
  return Object.fromEntries((await Promise.all(promises)).filter(([, volume]) => volume != null))
}

/**
 * Retrieves a mapping of pool IDs and addresses to pool names.
 * Unfortunately we cannot use an API as the pool names are generated in CurveJS
 */
const getServerSideCache = async (network: NetworkConfig) => {
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
  try {
    const { poolsMapper, poolsMapperCache } = await getPools(curveJS, curveJS.getPoolList(), network, {})
    const [tvl, volume] = await Promise.all([getTvlCache(network, poolsMapper), getVolumeCache(network, poolsMapper)])
    return { pools: poolsMapperCache, tvl, volume }
  } catch (e) {
    console.trace('failed', network.id, e)
    throw e
  }
}

async function refreshDex() {
  const dexNetworks = await getAllNetworks()
  for (const network of Object.values(dexNetworks)) {
    const networkStart = Date.now()
    DexServerSideCache[network.id] = await getServerSideCache(network)
    console.info(`Refreshed DEX ${network.id} in ${Date.now() - networkStart}ms`)
  }
}

refreshDataInBackground('DEX', refreshDex).catch(console.error)

export const dynamic = 'force-dynamic' // don't cache this route on the front-end, we are caching it on the server-side
export const revalidate = 60 // same as refreshDataInBackground, but cannot use variable here
export const GET = async (_request: Request, { params }: { params: Promise<{ network: string }> }) => {
  const network = (await params).network
  const response = DexServerSideCache[network]
  if (!response) {
    console.warn(`No cache for ${network}: ${Object.keys(DexServerSideCache)}`)
  }
  return Response.json(response ?? {})
}
