import { zeroAddress } from 'viem'
import { getRouteById, type RouteResponse } from '@ui-kit/entities/router-api.query'
import { assert } from '@ui-kit/utils/network'

export const RouteProviders = ['curve', 'enso', 'odos'] as const
export type RouteProvider = (typeof RouteProviders)[number]
export type RouteOption = RouteResponse

/**
 * Converts a cached router route into the minimal zapV2 payload expected by llamalend.js.
 */
export const parseRoute = (routeId: string | null | undefined) => {
  const {
    tx,
    amountOut: [outAmount],
    priceImpact,
  } = getRouteById(routeId)
  return {
    router: tx?.to ?? zeroAddress, // llamalend.js doesn't like `null` type
    calldata: tx?.data ?? '0x',
    quote: { outAmount, priceImpact: assert(priceImpact, 'missing price impact') },
  }
}
