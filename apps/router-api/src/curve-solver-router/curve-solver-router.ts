import { FastifyBaseLogger } from 'fastify'
import { Chain } from '@primitives/network.utils'
import type { RouterRouteResponse, RouteStep } from '@primitives/router.utils'
import { type RoutesQuery } from '../routes/routes.schemas'
import type { CurveSolverQuoteRequest, CurveSolverQuoteResponse } from './curve-solver.types'

const protocol = 'curve-solver' as const

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
  const { calldata, debug, expected_out, gas_estimate, router_address } = await getCurveSolverQuote(
    API_URLS[chainId],
    params,
    log,
  )
  const { coins, pools, pool_addresses, swap_addresses, swap_params } = debug?.routes.find(r => r.selected) ?? {}

  return [
    {
      router: protocol,
      amountIn: [amountIn],
      amountOut: [expected_out],
      gas: `${gas_estimate}`,
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
