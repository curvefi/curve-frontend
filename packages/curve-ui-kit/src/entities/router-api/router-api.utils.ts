import type { GetExpectedFn } from '@curvefi/llamalend-api/lib/interfaces'
import { ILeverageZapV2 } from '@curvefi/llamalend-api/lib/lendMarkets/interfaces/leverageZapV2'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert } from '@primitives/objects.utils'
import { fetchApiRoutes, getRouteById } from './router-api.query'
import type { RouteMeta, RouteMutationMeta, RoutesQuery } from './router-api.types'

/**
 * Converts a cached router route into the minimal zapV2 payload expected by llamalend.js.
 */
export const parseRoute = (routeId: string | undefined): RouteMeta => {
  const {
    tx,
    amountOut: [outAmount],
    priceImpact,
  } = getRouteById(routeId)
  const { to, data } = assert(tx, `No transaction information for route ${routeId}`)
  /* Enso returns no price impact when it has no usd price, the library will be updated to accept null */
  const quote = { outAmount, priceImpact: priceImpact! }
  return { router: to, calldata: data, quote }
}

/**
 * Like parseRoute, but also computes minRecv from outAmount and slippage.
 * minRecv = outAmount * (100 - slippage) / 100
 */
export const parseMutationRoute = (
  routeId: string | undefined,
  slippage: Decimal,
  zapv2: ILeverageZapV2,
): RouteMutationMeta => {
  const route = parseRoute(routeId)
  return { ...route, minRecv: zapv2.calcMinRecv(route.quote.outAmount, Number(slippage)) }
}

/**
 * This function can be used as a callback for curve-js calldata methods or llamalend.js leverageZapV2 methods.
 */
export const getExpectedFn =
  ({
    chainId,
    router,
    userAddress,
    slippage,
  }: Pick<RoutesQuery, 'chainId' | 'router' | 'slippage' | 'userAddress'>): GetExpectedFn =>
  async (tokenIn, tokenOut, amountIn) => {
    const routes = await fetchApiRoutes({
      chainId,
      tokenIn: tokenIn as Address,
      tokenOut: tokenOut as Address,
      amountIn: `${amountIn}` as Decimal,
      router,
      slippage,
      userAddress,
    })
    const route = assert(routes?.[0], 'No route available')
    return parseRoute(route.id).quote
  }
