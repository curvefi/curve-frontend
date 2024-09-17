import { chainKeys } from '@/entities/chain'
import type { PoolQueryParams } from '@/entities/pool/types'
import type { ChainQueryParams } from '@/entities/chain/types'

export const poolKeys = {
  root: ({ chainId }: ChainQueryParams) => [...chainKeys.root({ chainId }), 'pools'] as const,
  pool: ({ chainId, poolId }: PoolQueryParams) => [...poolKeys.root({ chainId }), poolId] as const,
} as const
