import type { FastifyRequest } from 'fastify'
import { fetchJson } from '@primitives/fetch.utils'
import { Chain } from '@primitives/network.utils'
import type { UniswapV3PoolStats } from '@primitives/router.utils'
import type { UniswapV3PoolsQuery } from './uniswap-pools.schemas'

const DEFILLAMA_POOLS_URL = 'https://yields.llama.fi/pools'
/** DefiLlama refreshes yields hourly; this only spares refetching its 10+ MB response on every request. */
const CACHE_TTL_MS = 10 * 60 * 1000

const DEFILLAMA_CHAINS: Partial<Record<number, string>> = {
  [Chain.Ethereum]: 'Ethereum',
  [Chain.Optimism]: 'Optimism',
  [Chain.Polygon]: 'Polygon',
  [Chain.Base]: 'Base',
  [Chain.Arbitrum]: 'Arbitrum',
}

type DefiLlamaPool = {
  chain: string
  project: string
  /** Fee tier, e.g. "0.05%". */
  poolMeta: string | null
  tvlUsd: number
  volumeUsd7d?: number | null
  underlyingTokens?: string[] | null
}

let cache: { fetchedAt: number; byChain: Promise<Map<string, Record<string, UniswapV3PoolStats>>> } | undefined

const loadPools = async () => {
  const { data } = await fetchJson<{ data: DefiLlamaPool[] }>(DEFILLAMA_POOLS_URL)
  const byChain = new Map<string, Record<string, UniswapV3PoolStats>>()
  data
    .filter(
      ({ project, underlyingTokens, poolMeta }) =>
        project === 'uniswap-v3' && underlyingTokens?.length === 2 && poolMeta,
    )
    .forEach(({ chain, poolMeta, tvlUsd, volumeUsd7d, underlyingTokens }) => {
      const fee = Math.round(parseFloat(poolMeta!) * 10_000)
      const key = `${underlyingTokens!.map(token => token.toLowerCase()).join('-')}-${fee}`
      const pools = byChain.get(chain) ?? {}
      pools[key] = { tvlUsd, volumeUsd7d: volumeUsd7d ?? null }
      byChain.set(chain, pools)
    })
  return byChain
}

/** Uniswap v3 pool volume and TVL from DefiLlama's yield server, which has no per-pool lookup by address. */
export const getUniswapV3Pools = async ({
  query: { chainId },
}: FastifyRequest<{ Querystring: UniswapV3PoolsQuery }>) => {
  const chain = DEFILLAMA_CHAINS[chainId]
  if (!chain) return {}
  if (!cache || Date.now() - cache.fetchedAt > CACHE_TTL_MS) {
    const byChain = loadPools()
    cache = { fetchedAt: Date.now(), byChain }
    byChain.catch(() => (cache = undefined)) // retry on the next request
  }
  return (await cache.byChain).get(chain) ?? {}
}
