import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { NetworkDef } from '@legacy-ui/utils'

export type ChainId = 1 // note lend also has other chains, but we only use eth in this app

/** LOAN app specific API that constrains chainId to Ethereum only */
export type NetworkEnum = Extract<INetworkName, 'ethereum'>

export type NetworkUrlParams = { network: NetworkEnum }
export type CollateralUrlParams = NetworkUrlParams & { collateralId: string }
export type UrlParams = NetworkUrlParams & Partial<CollateralUrlParams>

export type NetworkConfig = { showInSelectNetwork: boolean } & NetworkDef<NetworkEnum, ChainId>
