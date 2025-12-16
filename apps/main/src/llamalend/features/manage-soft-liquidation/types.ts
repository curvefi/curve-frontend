import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { Address } from '@ui-kit/utils'

/** Required properties for basically every hook and query */
export type MarketParams = {
  chainId: IChainId
  marketId: string
  network: LlamaNetwork
}

export type Token = {
  address: Address
  symbol: string
  chain?: string
}
