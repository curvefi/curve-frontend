import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { FieldsOf } from '@ui/lib/validation/types'

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

export const rootKeys = {
  chain: <T = number>({ chainId }: ChainParams<T>) => ({ chainId }) as const,
  chainName: ({ blockchainId }: ChainNameParams) => ({ blockchainId }) as const,

  user: <T = Address>({ userAddress }: UserParams<T>) => ({ userAddress }) as const,
  userChain: <TChain = number, TUser = Address>({ chainId, userAddress }: UserChainParams<TChain, TUser>) =>
    ({ ...rootKeys.chain({ chainId }), ...rootKeys.user({ userAddress }) }) as const,

  pool: <T = number>({ chainId, poolId }: PoolParams<T>) => ({ ...rootKeys.chain({ chainId }), poolId }) as const,
  userPool: <TChain = number, TUser = Address>({ chainId, poolId, userAddress }: UserPoolParams<TChain, TUser>) =>
    ({ ...rootKeys.pool({ chainId, poolId }), ...rootKeys.user({ userAddress }) }) as const,

  contract: ({ blockchainId, contractAddress }: ContractParams) =>
    ({ ...rootKeys.chainName({ blockchainId }), contractAddress }) as const,

  gauge: <T = number>(params: GaugeParams<T>) => rootKeys.pool(params),
  token: ({ chainId, tokenAddress }: TokenParams) => ({ ...rootKeys.chain({ chainId }), tokenAddress }) as const,

  market: ({ chainId, marketId }: MarketParams) => ({ ...rootKeys.chain({ chainId }), marketId }) as const,
  userMarket: ({ chainId, marketId, userAddress }: UserMarketParams) =>
    ({ ...rootKeys.market({ chainId, marketId }), ...rootKeys.user({ userAddress }) }) as const,
} as const
