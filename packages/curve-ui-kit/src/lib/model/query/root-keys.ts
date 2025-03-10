import type { Address, Chain } from '@curvefi/prices-api'
import { FieldsOf } from '@ui-kit/lib'

export type ChainQuery<T = number> = { chainId: T }
export type UserQuery = { userAddress: Address }
export type ChainNameQuery = { blockchainId: Chain }

export type ContractQuery = ChainNameQuery & { contractAddress: Address }
export type PoolQuery<T = number> = ChainQuery<T> & { poolId: string }
export type GaugeQuery<T = number> = PoolQuery<T>

export type ChainParams<T = number> = FieldsOf<ChainQuery<T>>
export type UserParams = FieldsOf<UserQuery>
export type ChainNameParams = FieldsOf<ChainNameQuery>

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
