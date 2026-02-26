import type { GetExpectedFn } from '@curvefi/llamalend-api/src/interfaces'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert } from '@primitives/objects.utils'
import { parseRoute } from '@ui-kit/widgets/RouteProvider'
import { fetchApiRoutes } from './router-api.query'
import type { RoutesQuery } from './router-api.types'

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
