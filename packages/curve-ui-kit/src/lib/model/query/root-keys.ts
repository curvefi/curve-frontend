import type { Address, Chain } from '@curvefi/prices-api'
import { FieldsOf } from '@ui-kit/lib'

export type ChainQuery<T = number> = { chainId: T }
export type UserQuery<T = Address> = { userAddress: T }
export type ChainNameQuery<T = Chain> = { blockchainId: T }

export type ContractQuery<T = Chain> = ChainNameQuery<T> & { contractAddress: Address }
export type PoolQuery<T = number> = ChainQuery<T> & { poolId: string }
export type GaugeQuery<T = number> = PoolQuery<T>
export type TokenQuery = ChainQuery & { tokenAddress: string }

export type ChainParams<T = number> = FieldsOf<ChainQuery<T>>
export type UserParams<T = Address> = FieldsOf<UserQuery<T>>
export type ChainNameParams<T = Chain> = FieldsOf<ChainNameQuery<T>>

export type ContractParams = FieldsOf<ContractQuery>
export type PoolParams<T = number> = FieldsOf<PoolQuery<T>>
export type GaugeParams<T = number> = FieldsOf<GaugeQuery<T>>
export type TokenParams = FieldsOf<TokenQuery>

export const rootKeys = {
  chain: <T = number>({ chainId }: ChainParams<T>) => ['chain', { chainId }] as const,
  chainName: ({ blockchainId }: ChainNameParams) => ['chain', { blockchainId }] as const,
  pool: <T = number>({ chainId, poolId }: PoolParams<T>) =>
    [...rootKeys.chain({ chainId }), 'pool', { poolId }] as const,
  contract: ({ blockchainId, contractAddress }: ContractParams) =>
    [...rootKeys.chainName({ blockchainId }), 'contract', { contractAddress }] as const,
  gauge: <T = number>({ chainId, poolId }: GaugeParams<T>) => [...rootKeys.pool({ chainId, poolId }), 'gauge'] as const,
  token: ({ chainId, tokenAddress }: TokenParams) =>
    [...rootKeys.chain({ chainId }), 'token', { tokenAddress }] as const,
} as const
