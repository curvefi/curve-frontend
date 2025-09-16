import type { IChainId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { BaseConfig } from '@ui/utils'

export type NetworkDict<ChainId extends IChainId = IChainId> = Record<ChainId, BaseConfig<INetworkName, ChainId>>
