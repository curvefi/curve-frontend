import { FastifyBaseLogger } from 'fastify'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@primitives/network.utils'
import type { RouterRouteResponse, RouteStep } from '@primitives/router.utils'
import { type RoutesQuery } from '../routes/routes.schemas'
import type { CurveSolverQuoteRequest, CurveSolverQuoteResponse } from './curve-solver.types'

const protocol = 'curve-solver' as const

/**
 * Gets the smallest amountIn that can be used to get a quote from the solver to calculate the price impact.
 * Similar spirit to curve-js `_get_small_x`: use a small but meaningful input, avoiding dust-level quotes
 * like 1 wei / 100 wei that lead to noisy ratios.
 */
function getSmallAmountIn(amountIn: Decimal): bigint {
  const amountInInt = BigInt(amountIn)
  if (amountInInt <= 1n) return 1n
  const targetByMagnitude = 10n ** BigInt(Math.max(amountIn.length - 4, 0))
  const maxAllowed = amountInInt - 1n
  return targetByMagnitude > maxAllowed ? maxAllowed : targetByMagnitude
}

function calculatePriceImpact(
  amountIn: Decimal,
  expectedOut: Decimal,
  smallAmountIn: bigint,
  { expected_out: smallExpectedOut }: CurveSolverQuoteResponse,
  precision = 10_000n, // Return as percentage rounded to 4 decimals
) {
  const amountInInt = BigInt(amountIn)
  const expectedOutInt = BigInt(expectedOut)
  const smallAmountInInt = smallAmountIn
  const smallExpectedOutInt = BigInt(smallExpectedOut)

  if ([amountInInt, expectedOutInt, smallAmountInInt, smallExpectedOutInt].some(v => v <= 0n)) return null

  // Compare route rate against a near-spot rate from a tiny quote
  // priceImpact = (1 - (expectedOut / amountIn) / (smallExpectedOut / smallAmountIn)) * 100
  const numerator = expectedOutInt * smallAmountInInt
  const denominator = amountInInt * smallExpectedOutInt
  if (numerator >= denominator) return 0
  const scaled = ((denominator - numerator) * 100n * precision + denominator / 2n) / denominator
  return Number(scaled) / Number(precision)
}

const API_URLS: Record<number, string> = {
  [Chain.Ethereum]: 'https://ethereum.router.curve.finance',
  [Chain.Gnosis]: 'https://gnosis.router.curve.finance',
  [Chain.Arbitrum]: 'https://arbitrum.router.curve.finance',
}

async function getCurveSolverQuote(url: string, body: CurveSolverQuoteRequest, log: FastifyBaseLogger) {
  const response = await fetch(`${url}/quote?debug=true`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const responseText = await response.text()
    log.error({
      message: 'curve-solver route request failed',
      status: response.status,
      statusText: response.statusText,
      url,
      body,
      response: responseText,
    })
    throw new Error(`Curve solver route request failed: ${response.status} ${response.statusText} - ${responseText}`)
  }

  return (await response.json()) as CurveSolverQuoteResponse
}

/**
 * Calls the Curve solver router to get a quote and builds the router-api response.
 */
export const buildCurveSolverRouteResponse = async (
  query: RoutesQuery,
  log: FastifyBaseLogger,
): Promise<RouterRouteResponse[]> => {
  const {
    chainId,
    tokenIn: [tokenIn],
    tokenOut: [tokenOut],
    amountIn: [amountIn] = [],
    amountOut: [amountOut] = [],
    userAddress,
  } = query // todo: use slippage

  if (!API_URLS[chainId] || amountIn == null) {
    log.info({ message: 'curve-solver route request skipped', query })
    return []
  }

  const params: CurveSolverQuoteRequest = {
    input_token: tokenIn,
    output_token: tokenOut,
    amount_in: amountIn,
    exact: true,
    ...(userAddress && { receiver: userAddress }),
    min_out: amountOut ?? '0', // todo: use slippage?
  }
  const smallAmountIn = getSmallAmountIn(amountIn)
  const [{ calldata, debug, expected_out, gas_estimate, router_address }, smallResponse] = await Promise.all([
    getCurveSolverQuote(API_URLS[chainId], params, log),
    getCurveSolverQuote(API_URLS[chainId], { ...params, amount_in: `${Number(smallAmountIn)}`, min_out: '0' }, log),
  ])
  const { coins, pools, pool_addresses, swap_addresses, swap_params } = debug?.routes.find(r => r.selected) ?? {}
  const priceImpact = calculatePriceImpact(amountIn, expected_out, smallAmountIn, smallResponse)

  return [
    {
      router: protocol,
      amountIn: [amountIn],
      amountOut: [expected_out],
      gas: `${gas_estimate}`,
      priceImpact,
      createdAt: Date.now(),
      warnings: [], // todo: add warnings
      isStableswapRoute: false, // todo: check whether stable route is selected
      route: coins?.map(
        ([routeTokenIn, routeTokenOut], index): RouteStep => ({
          name: pools?.[index] ?? `step ${index}`,
          tokenIn: [routeTokenIn],
          tokenOut: [routeTokenOut],
          protocol,
          action: 'swap',
          chainId,
          args: {
            poolAddress: pool_addresses?.[index],
            swapAddress: swap_addresses?.[index],
            swapParams: swap_params?.[index],
          },
        }),
      ),
      // Solver only returns executable calldata when receiver is provided.
      ...(calldata &&
        router_address &&
        userAddress && { tx: { data: calldata, to: router_address, from: userAddress, value: '0' } }),
    },
  ]
}
