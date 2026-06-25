import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { Decimal } from '@primitives/decimal.utils'
import type { BaseConfig } from '@ui/utils'
import type { LlamaApi } from '@ui-kit/features/connect-wallet'
import type { QueryProp, Range } from '@ui-kit/types/util'

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

export type PageContentProps<T = UrlParams> = {
  curve: LlamaApi | null
  market: Llamma | undefined
  params: T
  rChainId: ChainId
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  apiMarket: QueryProp<LlamaMarket>
}

export type FetchStatus = '' | 'loading' | 'success' | 'error'
export type TransactionStatus = '' | 'loading' | 'confirming' | 'error' | 'success'
