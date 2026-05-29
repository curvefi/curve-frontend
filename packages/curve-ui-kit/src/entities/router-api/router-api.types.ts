import type { IQuote } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { RouteProvider, RouterRouteResponse } from '@primitives/router.utils'
import type { FieldsOf } from '@ui-kit/lib'
import type { QueryProp } from '@ui-kit/types/util'

export interface RoutesQuery {
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
export interface RouteMeta {
  router: string
  calldata: string
  quote: IQuote
}

/**
 * Route meta with minRecv for execution methods that require slippage protection
 */
export type RouteMutationMeta = RouteMeta & { minRecv: string }
export type RouteResponse = RouterRouteResponse & { id: string }
export type RouteQuery = QueryProp<RouteResponse | null> & { isFetching: boolean }
export type RouteQueries = Record<RouteProvider, RouteQuery>
