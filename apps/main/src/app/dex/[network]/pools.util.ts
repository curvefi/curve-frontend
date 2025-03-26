import memoizee from 'memoizee'
import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'
import type { DexServerSideNetworkCache } from '@/app/api/dex/types'
import { getServerData } from '@/background'
import { getNetworks } from '@/dex/lib/networks'
import { type PoolUrlParams } from '@/dex/types/main.types'

const options = { maxAge: 5 * 1000 * 60, promise: true, preFetch: true } as const

export const getAllNetworks = memoizee(getNetworks, options)

export async function getNetworkConfig(networkName: string) {
  const networks = await getAllNetworks()
  return Object.values(networks).find((n) => n.id === networkName)
}

export const getPoolName = async (
  { network: networkName, pool: poolFromUrl }: PoolUrlParams,
  httpHeaders: ReadonlyHeaders,
) => {
  try {
    const { pools } = (await getServerData<DexServerSideNetworkCache>(`dex/${networkName}`, httpHeaders)) ?? {}
    if (pools) {
      const poolCache = poolFromUrl.startsWith('0x')
        ? Object.values(pools).find(({ pool }) => pool.address === poolFromUrl)
        : pools[poolFromUrl]
      if (poolCache) return poolCache.pool.name
      console.warn(`Cannot find pool ${poolFromUrl} in ${networkName}. Pools: ${JSON.stringify(poolCache, null, 2)}`)
    }
  } catch (e) {
    console.error(`Cannot retrieve pool name`, e)
  }
  return poolFromUrl
}
