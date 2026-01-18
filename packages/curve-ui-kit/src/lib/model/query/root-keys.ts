import type { Address, Chain } from '@curvefi/prices-api'
import { FieldsOf } from '@ui-kit/lib'

export type ChainQuery<T = number> = { chainId: T }
export type UserQuery<T = Address> = { userAddress: T }
export type ChainNameQuery<T = Chain> = { blockchainId: T }

export type ContractQuery<T = Chain> = ChainNameQuery<T> & { contractAddress: Address }
export type PoolQuery<T = number> = ChainQuery<T> & { poolId: string }
export type UserPoolQuery<TChain = number, TUser = Address> = PoolQuery<TChain> & UserQuery<TUser>
export type GaugeQuery<T = number> = PoolQuery<T>
export type TokenQuery = ChainQuery & { tokenAddress: string }
export type MarketQuery<T = number> = ChainQuery<T> & { marketId: string }
export type UserMarketQuery<TChain = number, TAddress = Address> = MarketQuery<TChain> & UserQuery<TAddress>

export type ChainParams<T = number> = FieldsOf<ChainQuery<T>>
export type UserParams<T = Address> = FieldsOf<UserQuery<T>>
export type ChainNameParams<T = Chain> = FieldsOf<ChainNameQuery<T>>

export type MarketParams = FieldsOf<MarketQuery>
export type UserMarketParams<TChain = number, TAddress = Address> = FieldsOf<UserMarketQuery<TChain, TAddress>>
export type UserPoolParams<TChain = number, TAddress = Address> = FieldsOf<UserPoolQuery<TChain, TAddress>>
export type ContractParams = FieldsOf<ContractQuery>
export type PoolParams<T = number> = FieldsOf<PoolQuery<T>>
export type GaugeParams<T = number> = FieldsOf<GaugeQuery<T>>
export type TokenParams = FieldsOf<TokenQuery>

export const rootKeys = {
  chain: <T = number>({ chainId }: ChainParams<T>) => ['chain', { chainId }] as const,
  chainName: ({ blockchainId }: ChainNameParams) => ['chain', { blockchainId }] as const,

  user: <T = Address>({ userAddress }: UserParams<T>) => ['user', { userAddress }] as const,

  pool: <T = number>({ chainId, poolId }: PoolParams<T>) =>
    [...rootKeys.chain({ chainId }), 'pool', { poolId }] as const,
  userPool: <TChain = number, TUser = Address>({ chainId, poolId, userAddress }: UserPoolParams<TChain, TUser>) =>
    [...rootKeys.pool({ chainId, poolId }), ...rootKeys.user({ userAddress })] as const,

  contract: ({ blockchainId, contractAddress }: ContractParams) =>
    [...rootKeys.chainName({ blockchainId }), 'contract', { contractAddress }] as const,

  gauge: <T = number>({ chainId, poolId }: GaugeParams<T>) => [...rootKeys.pool({ chainId, poolId }), 'gauge'] as const,
  token: ({ chainId, tokenAddress }: TokenParams) =>
    [...rootKeys.chain({ chainId }), 'token', { tokenAddress }] as const,

  market: ({ chainId, marketId }: MarketParams) => [...rootKeys.chain({ chainId }), 'market', { marketId }] as const,
  userMarket: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    [...rootKeys.market({ chainId, marketId }), ...rootKeys.user({ userAddress })] as const,
} as const
