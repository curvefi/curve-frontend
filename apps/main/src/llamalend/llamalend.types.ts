import type { ReactNode } from 'react'
import type { IChainId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { BaseConfig } from '@ui/utils'

export type LlamaNetwork<ChainId extends IChainId = IChainId> = BaseConfig<INetworkName, ChainId>
export type NetworkDict<ChainId extends IChainId = IChainId> = Record<ChainId, LlamaNetwork<ChainId>>

export type LlamaMarketTemplate = MintMarketTemplate | LendMarketTemplate

export type HealthColorKey = 'healthy' | 'close_to_liquidation' | 'soft_liquidation' | 'hard_liquidation' | ''
export type HealthMode = {
  percent: string
  colorKey: HealthColorKey
  icon: ReactNode
  message: string | null
  warningTitle: string
  warning: string
}
