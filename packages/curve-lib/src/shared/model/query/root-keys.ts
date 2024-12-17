import { FieldsOf } from '../../lib'

export type ChainQuery<T = number> = { chainId: T }
export type PoolQuery<T = number> = ChainQuery<T> & { poolId: string }
export type GaugeQuery<T = number> = PoolQuery<T>

export type ChainParams<T = number> = FieldsOf<ChainQuery<T>>
export type PoolParams<T = number> = FieldsOf<PoolQuery<T>>
export type GaugeParams<T = number> = FieldsOf<GaugeQuery<T>>

export const rootKeys = {
  chain: <T = number>({ chainId }: ChainParams<T>) => ['chain', { chainId }] as const,
  pool: <T = number>({ chainId, poolId }: PoolParams<T>) =>
    [...rootKeys.chain({ chainId }), 'pool', { poolId }] as const,
  gauge: <T = number>({ chainId, poolId }: GaugeParams<T>) => [...rootKeys.pool({ chainId, poolId }), 'gauge'] as const,
} as const
