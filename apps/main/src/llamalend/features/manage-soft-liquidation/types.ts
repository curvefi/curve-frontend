import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'

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
