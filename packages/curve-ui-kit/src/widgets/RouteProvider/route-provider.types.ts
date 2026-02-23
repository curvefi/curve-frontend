import { zeroAddress } from 'viem'
import type { RouteResponse } from '@ui-kit/entities/router-api.query'
import { assert } from '../../utils/network'

export const RouteProviders = ['curve', 'enso', 'odos'] as const
export type RouteProvider = (typeof RouteProviders)[number]

export type RouteOption = RouteResponse

const noRouteForZapV2 = `No route for zapv2, please validate the arguments before calling this query.`

export const parseRoute = (route: RouteOption | null | undefined) => {
  const {
    tx,
    amountOut: [outAmount],
    priceImpact,
  } = assert(route, noRouteForZapV2)
  return {
    router: tx?.to ?? zeroAddress, // llamalend.js doesn't like `null` type
    calldata: tx?.data ?? '0x',
    quote: { outAmount, priceImpact: assert(priceImpact, 'missing price impact') },
  }
}
