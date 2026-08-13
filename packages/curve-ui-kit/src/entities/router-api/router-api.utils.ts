import { formatUnits } from 'ethers'
import type { GetExpectedFn } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { Address } from '@primitives/address.utils'
import { toArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { fetchApiRoutes, getRouteById } from './router-api.query'
import type { RouteMeta, RouteMutationMeta, RoutesQuery } from './router-api.types'

/**
 * Converts a cached router route into the minimal zapV2 payload expected by llamalend.js.
 */
export const parseRoute = (routeId: string | undefined): RouteMeta => {
  const route = getRouteById(routeId)
  const {
    tx,
    amountOut: [outAmount],
    priceImpact,
  } = route
  const { to, data } = assert(tx, `No transaction information for route ${routeId}`)
  /* Enso returns no price impact when it has no usd price, the library will be updated to accept null */
  const quote = { outAmount, priceImpact: priceImpact! }
  return { router: to, calldata: data, quote }
}

/** Ensures a cached route still belongs to the provider policy resolved by the calling feature. */
export const assertRouteProvider = (routeId: string | undefined, providers: readonly RouteProvider[]) => {
  const route = getRouteById(routeId)
  assert(providers.includes(route.router), `Route provider ${route.router} is not enabled`)
  return route
}

/**
 * Like parseRoute, but also computes minRecv from outAmount and slippage.
 * minRecv = outAmount * (100 - slippage) / 100
 */
export const parseMutationRoute = (
  market: MintMarketTemplate | LendMarketTemplate,
  { routeId, slippage, isRepay }: { routeId: string | undefined; slippage: Decimal; isRepay: boolean },
): RouteMutationMeta => {
  const route = parseRoute(routeId)
  const zapV2 = assert(market.leverageZapV2, `Invalid market template ${market.id}`)
  const decimals = market.coinDecimals[isRepay ? 0 : 1] // outCoin is borrow for repay, collateral otherwise
  const expected = formatUnits(BigInt(route.quote.outAmount), decimals)
  return { ...route, minRecv: zapV2.calcMinRecv(expected, Number(slippage)) }
}

/**
 * This function can be used as a callback for curve-js calldata methods or llamalend.js leverageZapV2 methods.
 */
export const getExpectedFn =
  ({
    chainId,
    router,
    userAddress,
    zapAddress,
    slippage,
  }: Pick<RoutesQuery, 'chainId' | 'slippage' | 'userAddress' | 'zapAddress'> & {
    router: NonNullable<RoutesQuery['router']>
  }): GetExpectedFn =>
  async (tokenIn, tokenOut, amountIn, blacklist) => {
    const providers = toArray(router)
    const routes = await fetchApiRoutes({
      chainId,
      tokenIn: tokenIn as Address,
      tokenOut: tokenOut as Address,
      amountIn: `${amountIn}` as Decimal,
      blacklist: toArray(blacklist as Address | readonly Address[]),
      router: providers,
      slippage,
      userAddress,
      zapAddress,
    })
    // prioritize curve solver and curve router
    const route = assert(
      routes.find(({ router }) => router === 'curve-solver') ??
        routes.find(({ router }) => router === 'curve') ??
        routes[0],
      'No route available',
    )
    return parseRoute(route.id).quote
  }

export const createHash = async (
  input: (number | string | null | undefined | readonly number[] | readonly string[])[],
  algorithm = 'SHA-256',
): Promise<string> =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest(
        algorithm,
        new TextEncoder().encode(input.map(v => toArray<number | string>(v).join(',')).join('-')),
      ),
    ),
  )
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
