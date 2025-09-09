import type { IChainId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { BaseConfig } from '@ui/utils'

export type NetworkEnum = INetworkName

export type NetworkUrlParams = { network: NetworkEnum }

export type NetworkDict<ChainId extends IChainId = IChainId> = Record<ChainId, BaseConfig<NetworkEnum, ChainId>>
