import type { ChainQueryParams } from '@/entities/chain/types'

export type PoolQueryParams = ChainQueryParams & {
  poolId: string
}
