import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { BaseConfig } from '@ui/utils'

export type { Provider } from '@ui-kit/lib/ethers'
export type { LlamaApi, Wallet } from '@ui-kit/features/connect-wallet'

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

export type Llamma = MintMarketTemplate

export type FetchStatus = '' | 'loading' | 'success' | 'error'
export type TransactionStatus = '' | 'loading' | 'confirming' | 'error' | 'success'
