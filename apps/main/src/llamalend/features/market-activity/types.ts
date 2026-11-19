import type { Chain } from '@curvefi/prices-api'
import type { Endpoint, LlammaEvent, LlammaTrade } from '@curvefi/prices-api/llamma'
import type { ActivityToken } from '@evm-ui/features/activity-table/types'
import type { Address, Token } from '@primitives/address.utils'

export type MarketActivityProps = {
  chainId: number
  blockchainId: Chain
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  ammAddress: Address | undefined
  endpoint: Endpoint
}

export type MarketTradeRow = Omit<LlammaTrade, 'tokenBought' | 'tokenSold'> & {
  chainId: number
  blockchainId: Chain
  tokenBought: ActivityToken
  tokenSold: ActivityToken
}
export type MarketEventRow = LlammaEvent & {
  chainId: number
  blockchainId: Chain
  collateralToken: ActivityToken | undefined
  borrowToken: ActivityToken | undefined
}
