import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { BaseConfig } from '@ui/utils'

export type ChainId = 1 // note lend also has other chains, but we only use eth in this app

/** LOAN app specific API that constrains chainId to Ethereum only */
export type NetworkEnum = Extract<INetworkName, 'ethereum'>

export type NetworkUrlParams = { network: NetworkEnum }
export type CollateralUrlParams = NetworkUrlParams & { collateralId: string }
export type UrlParams = NetworkUrlParams & Partial<CollateralUrlParams>

export type NetworkConfig = { isActiveNetwork: boolean; showInSelectNetwork: boolean } & BaseConfig<
  NetworkEnum,
  ChainId
>

type Llamma = MintMarketTemplate

export type FetchStatus = '' | 'loading' | 'success' | 'error'
export type TransactionStatus = '' | 'loading' | 'confirming' | 'error' | 'success'
