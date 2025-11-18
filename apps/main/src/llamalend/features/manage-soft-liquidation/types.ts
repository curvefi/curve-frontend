import { Address } from '@ui-kit/utils'

/** Required properties for basically every hook and query */
export type MarketParams = {
  chainId: number
  marketId: string
}

export type Token = {
  address: Address
  symbol: string
  chain?: string
}
