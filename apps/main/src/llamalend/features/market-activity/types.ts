import type { Chain } from '@curvefi/prices-api'
import type { VaultEvent } from '@curvefi/prices-api/llamalend'
import type { Endpoint, LlammaEvent, LlammaTrade } from '@curvefi/prices-api/llamma'
import type { ActivityToken } from '@evm-ui/features/activity-table/types'
import type { Address, Token } from '@primitives/address.utils'

export type MarketBorrowActivityProps = {
  chainId: number
  blockchainId: Chain
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  ammAddress: Address | undefined
  endpoint: Endpoint
}

export type MarketSupplyActivityProps = {
  chainId: number
  blockchainId: Chain
  borrowToken: Token | undefined
  vaultToken: Token | undefined
}

export type MarketTradeRow = Omit<LlammaTrade, 'tokenBought' | 'tokenSold'> & {
  chainId: number
  blockchainId: Chain
  tokenBought: ActivityToken
  tokenSold: ActivityToken
}
export type MarketBorrowEventRow = LlammaEvent & {
  chainId: number
  blockchainId: Chain
  collateralToken: ActivityToken | undefined
  borrowToken: ActivityToken | undefined
}

export type MarketSupplyEventRow = VaultEvent &
  Pick<MarketSupplyActivityProps, 'chainId' | 'blockchainId'> & {
    borrowToken: ActivityToken | undefined
    vaultToken: ActivityToken | undefined
  }
