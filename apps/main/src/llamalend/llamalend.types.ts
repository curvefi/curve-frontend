import type { IChainId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { BaseConfig } from '@ui/utils'

export type NetworkDict<ChainId extends IChainId = IChainId> = Record<ChainId, BaseConfig<INetworkName, ChainId>>

export type LlamaMarketTemplate = MintMarketTemplate | LendMarketTemplate

export type HealthColorKey = 'healthy' | 'close_to_liquidation' | 'soft_liquidation' | 'hard_liquidation' | ''
