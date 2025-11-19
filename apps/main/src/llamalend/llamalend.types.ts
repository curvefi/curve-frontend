import type { IChainId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { BaseConfig } from '@ui/utils'

export type LlamaNetwork<ChainId extends IChainId = IChainId> = BaseConfig<INetworkName, ChainId>
export type NetworkDict<ChainId extends IChainId = IChainId> = Record<ChainId, LlamaNetwork<ChainId>>

export type LlamaMarketTemplate = MintMarketTemplate | LendMarketTemplate
