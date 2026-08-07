import { formatUnits } from 'ethers'
import type { GetExpectedFn } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { Address } from '@primitives/address.utils'
import { toArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { FetchError } from '@primitives/fetch.utils'
import { Chain } from '@primitives/network.utils'
import { assert, notFalsy } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { fetchApiRoutes, getRouteById } from './router-api.query'
import type { RouteMeta, RouteMutationMeta, RouteResponse, RoutesQuery } from './router-api.types'

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
 * The curve-solver router supports more coins and routes than the curve router, e.g., sUSDe.
 * However, it doesn't support all chains such as Optimism. So in those cases, we prefer the curve router.
 */
const SOLVER_CHAINS = [Chain.Ethereum, Chain.Arbitrum] as const

const handleRouteError = (error: unknown) => {
  if (error instanceof FetchError) return []
  throw error
}

/** Tries providers in order, treating an upstream fetch failure like a missing route. */
const fetchFirstRoute = async (
  [router, ...fallbacks]: readonly RouteProvider[],
  params: Omit<RoutesQuery, 'router'>,
): Promise<RouteResponse | undefined> => {
  if (!router) return
  const [route] = await fetchApiRoutes({ ...params, router }).catch(handleRouteError)
  return route ?? fetchFirstRoute(fallbacks, params)
}

/**
 * This function can be used as a callback for curve-js calldata methods or llamalend.js leverageZapV2 methods.
 */
export const getExpectedFn = ({
  chainId,
  router,
  userAddress,
  zapAddress,
  slippage,
}: Pick<RoutesQuery, 'chainId' | 'router' | 'slippage' | 'userAddress' | 'zapAddress'>): GetExpectedFn => {
  const curveRouter = SOLVER_CHAINS.includes(chainId) ? 'curve-solver' : 'curve'
  // Max-receive runs before a route is selected, so ZapV2 falls back to other providers when the preferred one fails.
  const routers: readonly RouteProvider[] = router
    ? toArray(router)
    : notFalsy<RouteProvider>(
        curveRouter,
        zapAddress && 'enso',
        zapAddress && curveRouter === 'curve-solver' && 'curve',
      )

  return async (tokenIn, tokenOut, amountIn, blacklist) => {
    const route = assert(
      await fetchFirstRoute(routers, {
        chainId,
        tokenIn: tokenIn as Address,
        tokenOut: tokenOut as Address,
        amountIn: `${amountIn}` as Decimal,
        blacklist: toArray(blacklist as Address | readonly Address[]),
        slippage,
        userAddress,
        zapAddress,
      }),
      'No route available',
    )
    return parseRoute(route.id).quote
  }
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
