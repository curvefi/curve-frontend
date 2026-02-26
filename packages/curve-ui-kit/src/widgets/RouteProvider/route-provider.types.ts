import { zeroAddress } from 'viem'
import type { IQuote } from '@curvefi/llamalend-api/src/interfaces'
import { type RouteResponse } from '@primitives/router.utils'
import { getRouteById } from '@ui-kit/entities/router-api'

export type RouteOption = RouteResponse

export type RouteMeta = {
  router: string
  calldata: string
  quote: IQuote
}
/**
 * Converts a cached router route into the minimal zapV2 payload expected by llamalend.js.
 */
export const parseRoute = (routeId: string | undefined): RouteMeta => {
  const {
    tx,
    amountOut: [outAmount],
    priceImpact,
  } = getRouteById(routeId)
  return {
    router: tx?.to ?? zeroAddress, // llamalend.js doesn't like `null` type
    calldata: tx?.data ?? '0x',
    quote: {
      outAmount,
      priceImpact: priceImpact as number /* Enso returns no price impact when it has no usd price */,
    },
  }
}
