import { chainKeys } from '@/entities/chain'
import { PoolQueryParams, PoolsQueryParams } from '@/entities/pool/types'
import type { ChainQueryParams } from '@/entities/chain/types'

export const poolKeys = {
  root: ({ chainId }: PoolsQueryParams) => [...chainKeys.root({ chainId }), 'pools'] as const,
  pool: ({ chainId, poolId }: PoolQueryParams) => [...chainKeys.root({ chainId }), poolId] as const,
  liquidity: (params: PoolQueryParams) => [...poolKeys.pool(params), 'totalLiquidity'] as const,
  liquidityMapping: (params: PoolsQueryParams) => [...poolKeys.root(params), 'liquidityMapping'] as const,
  volume: (params: PoolQueryParams) => [...poolKeys.pool(params), 'volume'] as const,
  volumeMapping: (params: PoolsQueryParams) => [...poolKeys.root(params), 'volumeMapping'] as const,
} as const
