import type { Address, Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'

export type ZeroExQuoteRequest = {
  chainId: number
  sellToken: Address
  buyToken: Address
  sellAmount: Decimal
  taker: Address
  swapFeeRecipient?: Address
  swapFeeBps?: Decimal
  swapFeeToken?: Address
}

export type ZeroExQuoteResponse = {
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
    integratorFee: unknown
    zeroExFee: { amount: Decimal; token: Address; type: string } | null
    gasFee: unknown
  }
  issues: { simulationIncomplete: boolean; invalidSourcesPassed: string[] }
  zid: string
}

type ZeroExRouteFill = {
  from: Address
  to: Address
  source: string
  proportionBps: Decimal
}

type ZeroExRouteToken = {
  address: Address
  symbol: string
}
