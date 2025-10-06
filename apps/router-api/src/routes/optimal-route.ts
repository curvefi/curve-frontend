import BigNumber from 'bignumber.js'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { Address, zeroAddress } from 'viem'
import type { IRoute, IRouteStep } from '@curvefi/api/lib/interfaces'
import { PoolTemplate } from '@curvefi/api/lib/pools'
import { type CurveJS, loadCurve } from '../curvejs'
import {
  type Decimal,
  type OptimalRouteQuery,
  optimalRouteQuerySchema,
  routeItemSchema,
  type RouteResponse,
} from './optimal-route.schemas'

export const notFalsy = <T>(...items: (T | null | undefined | false | 0)[]): T[] => items.filter(Boolean) as T[]

export function registerOptimalRoute(server: FastifyInstance): void {
  server.get(
    '/api/router/optimal-route',
    {
      schema: { querystring: optimalRouteQuerySchema, response: { 200: { type: 'array', items: routeItemSchema } } },
    },
    async (request: FastifyRequest<{ Querystring: OptimalRouteQuery }>) => {
      const query = request.query
      return buildOptimalRouteResponse(await loadCurve(query.chainId), query)
    },
  )
}

export function parseRouterRoutes(curve: CurveJS, routes: IRouteStep[]) {
  const pools = routes.map((route): [IRouteStep, PoolTemplate | undefined] => {
    try {
      return [route, curve.getPool(route.poolId)]
    } catch (error) {
      console.info('routerBestRouteAndOutput missing poolName', route.poolId)
      return [route, undefined]
    }
  })
  return {
    routes: pools.map(([route, pool]) => ({ ...route, name: pool?.name ?? route.poolId, routeUrlId: pool?.id })),
    isStableswapRoute: pools.every(([, p]) => !p?.isCrypto),
  }
}

const LOW_EXCHANGE_RATE = 0.98

function _parseRoutesAndOutput(
  curve: CurveJS,
  routes: IRouteStep[],
  toAmount: Decimal,
  toStoredRate: Decimal | undefined,
  fromAmount: Decimal,
) {
  const { routes: parsedRoutes, isStableswapRoute } = parseRouterRoutes(curve, routes)
  const exchangeRate = (Number(fromAmount) ? new BigNumber(toAmount).dividedBy(fromAmount).toString() : '0') as Decimal
  return {
    parsedRoutes,
    isExchangeRateLow:
      isStableswapRoute &&
      Number(toAmount) &&
      (toStoredRate && Number(toStoredRate) > 1
        ? // toStoredRate is above 1 if the "toToken" is of type oracle or erc4626 in a stableswap-ng pool
          Number(fromAmount) / Number(toAmount) < Number(toStoredRate) * LOW_EXCHANGE_RATE
        : Number(toAmount) / Number(fromAmount) < LOW_EXCHANGE_RATE),
    isHighSlippage: isStableswapRoute && Number(exchangeRate) > LOW_EXCHANGE_RATE,
  }
}

/**
 * Get the stored rate for the to token in the last route.
 * Stored rate is important for checking if a token is of type oracle or erc4626.
 * Tokens of type oracle or erc4626 can have stored rates above 1 and should be handled differently when checking for low exchange rate.
 * @returns The stored rate for the to token in the last route.
 */
export async function routerGetToStoredRate(routes: IRoute, curve: CurveJS, toAddress: string) {
  const { poolAddress, poolId } = routes[routes.length - 1]
  if (poolAddress === zeroAddress) return
  const pool = curve.getPool(poolId)
  const storedRates = await pool.getStoredRates()
  return storedRates[
    pool.underlyingCoinAddresses.findIndex((r) => r.toLowerCase() === toAddress.toLowerCase())
  ] as Decimal
}

async function buildOptimalRouteResponse(curve: CurveJS, query: OptimalRouteQuery): Promise<RouteResponse[]> {
  const { tokenOut, tokenIn, chainId, amountIn, amountOut } = query
  const fromToken = tokenIn[0]
  const toToken = tokenOut[0]
  const fromAmount =
    amountIn?.[0] ?? ((await curve.router.required(fromToken, toToken, amountOut?.[0] ?? '0')) as Decimal)

  const { route: routes, output } = await curve.router.getBestRouteAndOutput(fromToken, toToken, fromAmount)

  if (routes.length === 0 && +output === 0) return []

  const [fetchedToAmount, priceImpact, toStoredRate] = await Promise.all([
    curve.router.expected(fromToken, toToken, fromAmount),
    curve.router.priceImpact(fromToken, toToken, fromAmount),
    routerGetToStoredRate(routes, curve, toToken),
  ])
  const { parsedRoutes, isExchangeRateLow, isHighSlippage } = _parseRoutesAndOutput(
    curve,
    routes,
    fetchedToAmount as Decimal,
    toStoredRate as Decimal,
    fromAmount,
  )
  return [
    {
      amountOut: output,
      priceImpact,
      createdAt: Date.now(),
      warnings: notFalsy(isExchangeRateLow && 'low-exchange-rate', isHighSlippage && 'high-slippage'),
      route: parsedRoutes.map(({ name, inputCoinAddress, outputCoinAddress, ...args }) => ({
        primary: name,
        action: 'swap',
        tokenIn: [inputCoinAddress as Address],
        tokenOut: [outputCoinAddress as Address],
        protocol: 'curve',
        chainId,
        args,
      })),
    },
  ]
}
