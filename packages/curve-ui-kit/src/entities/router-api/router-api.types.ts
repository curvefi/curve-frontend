import type { IQuote } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { RouteProvider } from '@primitives/router.utils'
import type { FieldsOf } from '@ui-kit/lib'

export type RoutesQuery = {
  chainId: number
  tokenIn: Address
  tokenOut: Address
  amountIn?: Decimal
  amountOut?: Decimal
  router?: RouteProvider | readonly RouteProvider[]
  userAddress?: Address
  slippage?: Decimal
}

export type RoutesParams = FieldsOf<RoutesQuery>

/**
 * Route meta expected by the curve/llamalend.js libraries
 */
export type RouteMeta = {
  router: string
  calldata: string
  quote: IQuote
}
