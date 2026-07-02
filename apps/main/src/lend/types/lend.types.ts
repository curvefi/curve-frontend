import type { IChainId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { BaseConfig } from '@ui/utils'

export type ChainId = IChainId
export type NetworkEnum = INetworkName

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
