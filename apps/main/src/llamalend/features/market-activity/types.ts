import type { Chain } from '@curvefi/prices-api'
import type { Endpoint } from '@curvefi/prices-api/llamma'
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
