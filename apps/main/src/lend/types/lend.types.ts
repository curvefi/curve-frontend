import type { MarketTokens } from '@/llamalend/llama.utils'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Address } from '@primitives/address.utils'
import type { BaseConfig } from '@ui/utils'
import type { LlamaApi } from '@ui-kit/features/connect-wallet'
import type { LlamaMarketType } from '@ui-kit/types/market'
import type { QueryProp } from '@ui-kit/types/util'

export type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
export type { Wallet } from '@ui-kit/features/connect-wallet'
export type { Provider } from '@ui-kit/lib/ethers'

export type Api = LlamaApi
export type AlertType = 'info' | 'warning' | 'error' | 'danger'
export type ChainId = IChainId
export type NetworkEnum = INetworkName
export type EstimatedGas = number | number[] | null

export type NetworkUrlParams = { network: NetworkEnum }
export type MarketUrlParams = NetworkUrlParams & { market: string }
export type UrlParams = NetworkUrlParams & Partial<MarketUrlParams>

export type NetworkConfig<TId extends string = string, TChainId extends number = number> = {
  isActiveNetwork: boolean
  showInSelectNetwork: boolean
  hideMarketsInUI: Record<string, boolean>
  marketListFilter: string[]
  marketListFilterType: string[]
  pricesData: boolean
} & BaseConfig<TId, TChainId>

export type PageContentProps<T = UrlParams> = {
  params: T
  chainId: ChainId
  userAddress: Address | undefined
  api: LlamaApi | null
  market: LendMarketTemplate | undefined
  marketId: string | undefined
  ammAddress: Address | undefined
  zapAddress: Address | undefined
  controllerAddress: Address | undefined
  tokens: Partial<MarketTokens>
  marketType: LlamaMarketType
  vaultToken: MarketTokens['borrowToken'] | undefined
  gaugeAddress: Address | undefined
  minBands: number | undefined
  maxBands: number | undefined
  crvTokenAddress: Address | undefined
  apiMarket: QueryProp<LlamaMarket>
}

export type RewardOther = {
  apy: number
  decimals?: number
  gaugeAddress: string
  name?: string
  symbol: string
  tokenAddress: string
  tokenPrice?: number
}
