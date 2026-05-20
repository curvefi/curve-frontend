import type { Address, Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'

export interface ZeroExQuoteRequest {
  chainId: number
  sellToken: Address
  buyToken: Address
  sellAmount: Decimal
  taker: Address
}

export interface ZeroExQuoteResponse {
  buyAmount: Decimal
  buyToken: Address
  sellAmount: Decimal
  sellToken: Address
  liquidityAvailable: boolean
  minBuyAmount: Decimal
  totalNetworkFee: Decimal
  transaction: { to: Address; data: Hex; gas: Decimal; gasPrice: Decimal; value: Decimal }
  route: { fills: ZeroExRouteFill[]; tokens: ZeroExRouteToken[] }
  fees: {
    integratorFee: unknown | null
    zeroExFee: { amount: Decimal; token: Address; type: string } | null
    gasFee: unknown | null
  }
  issues: { simulationIncomplete: boolean; invalidSourcesPassed: string[] }
  zid: string
}

export interface ZeroExRouteFill {
  from: Address
  to: Address
  source: string
  proportionBps: Decimal
}

export interface ZeroExRouteToken {
  address: Address
  symbol: string
}
