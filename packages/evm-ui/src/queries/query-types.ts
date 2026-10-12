import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import type { FieldsOf } from '@ui/lib/validation/types'

export type ChainQuery<T = number> = { chainId: T }
export type UserQuery<T = Address> = { userAddress: T }
export type ChainNameQuery<T = Chain> = { blockchainId: T }

export type ContractQuery<T = Chain> = ChainNameQuery<T> & { contractAddress: Address }
export type PoolQuery<T = number> = ChainQuery<T> & { poolId: string }
export type UserChainQuery<TChain = number, TAddress = Address> = ChainQuery<TChain> & UserQuery<TAddress>
export type UserPoolQuery<TChain = number, TUser = Address> = PoolQuery<TChain> & UserQuery<TUser>
export type GaugeQuery<T = number> = PoolQuery<T>
export type TokenQuery = ChainQuery & { tokenAddress: string }
export type MarketQuery<T = number> = ChainQuery<T> & { marketId: string }
export type UserMarketQuery<TChain = number, TAddress = Address> = MarketQuery<TChain> & UserQuery<TAddress>
export type UserContractQuery<TChain = Chain, TAddress = Address> = UserQuery<TAddress> & ContractQuery<TChain>

export type ChainParams<T = number> = FieldsOf<ChainQuery<T>>
export type UserParams<T = Address> = FieldsOf<UserQuery<T>>
export type ChainNameParams<T = Chain> = FieldsOf<ChainNameQuery<T>>

export type MarketParams<TChain = number> = FieldsOf<MarketQuery<TChain>>
export type UserChainParams<TChain = number, TAddress = Address> = FieldsOf<UserChainQuery<TChain, TAddress>>
export type UserMarketParams<TChain = number, TAddress = Address> = FieldsOf<UserMarketQuery<TChain, TAddress>>
export type UserPoolParams<TChain = number, TAddress = Address> = FieldsOf<UserPoolQuery<TChain, TAddress>>
export type ContractParams<TChain = Chain> = FieldsOf<ContractQuery<TChain>>
export type UserContractParams<TChain = Chain, TAddress = Address> = FieldsOf<UserContractQuery<TChain, TAddress>>
export type PoolParams<T = number> = FieldsOf<PoolQuery<T>>
export type GaugeParams<T = number> = FieldsOf<GaugeQuery<T>>
export type TokenParams = FieldsOf<TokenQuery>
