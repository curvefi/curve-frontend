import type { Hex } from 'viem'
import { assert } from '../../utils'
import type { Address } from '../../utils/address'
import type { Decimal } from '../../utils/decimal'

export const RouteProviders = ['curve', 'enso', 'odos'] as const
export type RouteProvider = (typeof RouteProviders)[number]

export type RouteOption = {
  provider: RouteProvider
  toAmountOutput: Decimal
  usdPrice: number | null
  priceImpact: number
  routerAddress: Address
  calldata: Hex
}

const noRouteForZapV2 = `No route for zapv2, please validate the arguments before calling this query.`

export const parseRoute = (route: RouteOption | null | undefined) => {
  const { routerAddress, calldata, priceImpact, toAmountOutput } = assert(route, noRouteForZapV2)
  const quote = { outAmount: toAmountOutput, priceImpact }
  // todo: some functions use dDebt but borrowMore uses debt
  return { router: routerAddress, calldata, quote }
}
