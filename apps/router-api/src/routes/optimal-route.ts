import BigNumber from 'bignumber.js'
import type { FastifyRequest } from 'fastify'
import { FastifyBaseLogger } from 'fastify'
import { Address, zeroAddress } from 'viem'
import type { IRoute, IRouteStep } from '@curvefi/api/lib/interfaces'
import { PoolTemplate } from '@curvefi/api/lib/pools'
import { type CurveJS, loadCurve } from '../curvejs'
import { type Decimal, type OptimalRouteQuery, type RouteResponse } from './optimal-route.schemas'

export const notFalsy = <T>(...items: (T | null | undefined | false | 0)[]): T[] => items.filter(Boolean) as T[]

/**
 * Handles the optimal route request. Returns the optimal route for the given parameters.
 */
export const getOptimalRoute = async (request: FastifyRequest<{ Querystring: OptimalRouteQuery }>) => {
  const query = request.query
  const result = await buildOptimalRouteResponse(query, request.log)
  request.log.info({ message: 'route calculated', query, result })
  return result
}

/**
 * Returns an array of tuples containing the route step and the corresponding pool object (or undefined if not found).
 * If a pool is not found, it logs the missing poolId to the log.
 */
const tryGetPools = (routes: IRouteStep[], curve: CurveJS, log: FastifyBaseLogger) =>
  routes.map((route): [IRouteStep, PoolTemplate | undefined] => {
    try {
      return [route, curve.getPool(route.poolId)]
    } catch (error) {
      log.info({ message: 'routerBestRouteAndOutput missing poolName', poolId: route.poolId })
      return [route, undefined]
    }
  })

const LOW_EXCHANGE_RATE = 0.98

/**
 * Get the stored rate for the to token in the last route.
 * Stored rate is important for checking if a token is of type oracle or erc4626.
 * Tokens of type oracle or erc4626 can have stored rates above 1 and should be handled differently when checking for low exchange rate.
 * @returns The stored rate for the to token in the last route.
 */
async function routerGetToStoredRate(routes: IRoute, curve: CurveJS, toAddress: string) {
  const { poolAddress, poolId } = routes[routes.length - 1]
  if (poolAddress === zeroAddress) return
  const pool = curve.getPool(poolId)
  const storedRates = await pool.getStoredRates()
  return storedRates[
    pool.underlyingCoinAddresses.findIndex((r) => r.toLowerCase() === toAddress.toLowerCase())
  ] as Decimal
}

/**
 * Runs the router to get the optimal route and builds the response.
 */
async function buildOptimalRouteResponse(query: OptimalRouteQuery, log: FastifyBaseLogger): Promise<RouteResponse[]> {
  const {
    tokenOut: [toToken],
    tokenIn: [fromToken],
    chainId,
    amountIn: [amountIn] = [],
    amountOut,
  } = query

  const curve = await loadCurve(chainId, log)
  const fromAmount = amountIn ?? ((await curve.router.required(fromToken, toToken, amountOut?.[0] ?? '0')) as Decimal)
  const { route: routes, output: toAmount } = await curve.router.getBestRouteAndOutput(fromToken, toToken, fromAmount)
  if (!routes.length) return []

  const [priceImpact, toStoredRate] = await Promise.all([
    curve.router.priceImpact(fromToken, toToken, fromAmount),
    routerGetToStoredRate(routes, curve, toToken),
  ])

  const pools = tryGetPools(routes, curve, log)
  const parsedRoutes = pools.map(([route, pool]) => ({
    ...route,
    name: pool?.name ?? route.poolId,
    routeUrlId: pool?.id,
  }))
  const isStableswapRoute = pools.every(([, p]) => !p?.isCrypto)
  const exchangeRate = Number(fromAmount) ? new BigNumber(toAmount).dividedBy(fromAmount).toNumber() : 0
  const isExchangeRateLow =
    isStableswapRoute &&
    Number(toAmount) &&
    (toStoredRate && Number(toStoredRate) > 1
      ? // toStoredRate is above 1 if the "toToken" is of type oracle or erc4626 in a stableswap-ng pool
        Number(fromAmount) / Number(toAmount) < Number(toStoredRate) * LOW_EXCHANGE_RATE
      : Number(toAmount) / Number(fromAmount) < LOW_EXCHANGE_RATE)
  const isHighSlippage = isStableswapRoute && exchangeRate > LOW_EXCHANGE_RATE

  return [
    {
      amountIn: fromAmount,
      amountOut: toAmount as Decimal,
      priceImpact,
      createdAt: Date.now(),
      isStableswapRoute,
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
