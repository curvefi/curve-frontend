import { FieldsOf } from '@ui-kit/lib'
import type { Address } from 'viem'

export type ChainQuery<T = number> = { chainId: T }
export type ChainNameQuery<T = string> = { blockchainId: T }
export type UserAddressQuery = { userAddress: Address }

export type ContractQuery = ChainNameQuery & { contractAddress: string }
export type PoolQuery<T = number> = ChainQuery<T> & { poolId: string }
export type GaugeQuery<T = number> = PoolQuery<T>

export type ChainParams<T = number> = FieldsOf<ChainQuery<T>>
export type ChainNameParams<T = string> = FieldsOf<ChainNameQuery<T>>
export type UserAddressParams = FieldsOf<UserAddressQuery>

export type ContractParams = FieldsOf<ContractQuery>
export type PoolParams<T = number> = FieldsOf<PoolQuery<T>>
export type GaugeParams<T = number> = FieldsOf<GaugeQuery<T>>

export const rootKeys = {
  chain: <T = number>({ chainId }: ChainParams<T>) => ['chain', { chainId }] as const,
  chainName: ({ blockchainId }: ChainNameParams) => ['chain', { blockchainId }] as const,
  pool: <T = number>({ chainId, poolId }: PoolParams<T>) =>
    [...rootKeys.chain({ chainId }), 'pool', { poolId }] as const,
  contract: ({ blockchainId, contractAddress }: ContractParams) =>
    [...rootKeys.chainName({ blockchainId }), 'contract', { contractAddress }] as const,
  gauge: <T = number>({ chainId, poolId }: GaugeParams<T>) => [...rootKeys.pool({ chainId, poolId }), 'gauge'] as const,
} as const
