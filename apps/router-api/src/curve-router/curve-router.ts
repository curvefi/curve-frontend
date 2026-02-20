import BigNumber from 'bignumber.js'
import { FastifyBaseLogger } from 'fastify'
import { Address, zeroAddress } from 'viem'
import type { IRoute, IRouteStep } from '@curvefi/api/lib/interfaces'
import { PoolTemplate } from '@curvefi/api/lib/pools'
import { notFalsy } from '../router.utils'
import {
  type Decimal,
  type OptimalRouteQuery,
  type RouteResponse,
  type RouteStep,
} from '../routes/optimal-route.schemas'
import { type CurveJS, loadCurve } from './curvejs'

/**
 * Returns an array of tuples containing the route step and the corresponding pool object (or undefined if not found).
 * If a pool is not found, it logs the missing poolId to the log.
 */
const tryGetPools = (routes: IRouteStep[], curve: CurveJS, log: FastifyBaseLogger) =>
  routes.map((route): [IRouteStep, PoolTemplate | undefined] => {
    try {
      return [route, curve.getPool(route.poolId)]
    } catch (error) {
      log.info({ message: 'routerBestRouteAndOutput missing poolName', poolId: route.poolId }, error.message)
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

function getWarnings(
  fromAmount: string,
  toAmount: string,
  isStableswapRoute: boolean,
  toStoredRate: string | undefined,
): RouteResponse['warnings'] {
  const exchangeRate = Number(fromAmount) ? new BigNumber(toAmount).dividedBy(fromAmount).toNumber() : 0
  const isExchangeRateLow =
    isStableswapRoute &&
    Number(toAmount) &&
    (toStoredRate && Number(toStoredRate) > 1
      ? // toStoredRate is above 1 if the "toToken" is of type oracle or erc4626 in a stableswap-ng pool
        Number(fromAmount) / Number(toAmount) < Number(toStoredRate) * LOW_EXCHANGE_RATE
      : Number(toAmount) / Number(fromAmount) < LOW_EXCHANGE_RATE)
  const isHighSlippage = isStableswapRoute && exchangeRate > LOW_EXCHANGE_RATE
  return notFalsy(isExchangeRateLow && 'low-exchange-rate', isHighSlippage && 'high-slippage')
}

const fromWei = (s: Decimal, decimals: number) =>
  new BigNumber(s).dividedBy(new BigNumber(10).pow(decimals)).toString() as Decimal

/**
 * Runs the router to get the optimal route and builds the response.
 */
export async function buildCurveRouteResponse(
  query: OptimalRouteQuery,
  log: FastifyBaseLogger,
): Promise<RouteResponse[]> {
  const {
    tokenOut: [toToken],
    tokenIn: [fromToken],
    chainId,
    amountIn: [amountIn] = [],
    amountOut: [amountOut] = [],
  } = query

  const curve = await loadCurve(chainId, log)
  const decimals = curve.getNetworkConstants().DECIMALS

  const outAmount = fromWei(amountOut ?? '0', decimals[toToken.toLowerCase()] ?? decimals[toToken])
  const fromAmount = amountIn
    ? fromWei(amountIn, decimals[fromToken.toLowerCase()] ?? decimals[fromToken])
    : ((await curve.router.required(fromToken, toToken, outAmount)) as Decimal)
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
  const warnings = getWarnings(fromAmount, toAmount, isStableswapRoute, toStoredRate)

  return [
    {
      router: 'curve',
      amountIn: [fromAmount],
      amountOut: [toAmount as Decimal],
      priceImpact,
      createdAt: Date.now(),
      isStableswapRoute,
      warnings: warnings,
      route: parsedRoutes.map(
        ({ name, inputCoinAddress, outputCoinAddress, ...args }): RouteStep => ({
          name,
          action: 'swap',
          tokenIn: [inputCoinAddress as Address],
          tokenOut: [outputCoinAddress as Address],
          protocol: 'curve',
          chainId,
          args,
        }),
      ),
    },
  ]
}
