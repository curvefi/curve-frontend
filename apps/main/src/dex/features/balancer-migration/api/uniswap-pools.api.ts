import { fetchJson } from '@primitives/fetch.utils'
import type { UniswapV3PoolStats } from '@primitives/router.utils'
import type { UniswapPosition } from './uniswap.api'

/** Keyed like router-api: lowercase token0, token1 and the fee tier. */
export const getUniswapPoolStatsKey = ({ tokens: [token0, token1], fee }: UniswapPosition) =>
  `${token0.address.toLowerCase()}-${token1.address.toLowerCase()}-${fee}`

export const fetchUniswapV3Pools = (chainId: number) =>
  fetchJson<Record<string, UniswapV3PoolStats>>(`/api/router/v1/uniswap-v3-pools?chainId=${chainId}`)
