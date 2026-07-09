import { FastifyBaseLogger } from 'fastify'
import { FetchError, fetchJson } from '@primitives/fetch.utils'
import { Chain } from '@primitives/network.utils'
import type { RouterRouteResponse, RouteStep } from '@primitives/router.utils'
import { type RoutesQuery } from '../routes/routes.schemas'
import type { CurveSolverQuoteRequest, CurveSolverQuoteResponse } from './curve-solver.types'

const PROTOCOL = 'curve-solver' as const

const API_URLS: Record<number, string> = {
  [Chain.Ethereum]: 'https://ethereum.router.curve.finance',
  [Chain.Gnosis]: 'https://gnosis.router.curve.finance',
  [Chain.Arbitrum]: 'https://arbitrum.router.curve.finance',
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
    blacklist = [],
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
    blacklist,
    exact: true,
    ...(userAddress && { receiver: userAddress }),
    min_out: amountOut ?? '0', // todo: use slippage?
  }
  const { calldata, debug, expected_out, gas_estimate, router_address } = await fetchJson<CurveSolverQuoteResponse>(
    `${API_URLS[chainId]}/quote?debug=true`,
    { body: params },
  ).catch(error => logSolverError(error, log, API_URLS[chainId], params))
  const { coins, pools, pool_addresses, swap_addresses, swap_params } = debug?.routes.find(r => r.selected) ?? {}

  return [
    {
      router: PROTOCOL,
      amountIn: [amountIn],
      amountOut: [expected_out],
      gas: `${gas_estimate}`,
      priceImpact: null,
      createdAt: Date.now(),
      warnings: [], // todo: add warnings
      isStableswapRoute: false, // todo: check whether stable route is selected
      route: coins?.map(([routeTokenIn, routeTokenOut], index): RouteStep => ({
        name: pools?.[index] ?? `step ${index}`,
        tokenIn: [routeTokenIn],
        tokenOut: [routeTokenOut],
        protocol: PROTOCOL,
        action: 'swap',
        chainId,
        args: {
          poolAddress: pool_addresses?.[index],
          swapAddress: swap_addresses?.[index],
          swapParams: swap_params?.[index],
        },
      })),
      // Solver only returns executable calldata when receiver is provided.
      ...(calldata &&
        router_address &&
        userAddress && { tx: { data: calldata, to: router_address, from: userAddress, value: '0' } }),
    },
  ]
}

function logSolverError(error: unknown, log: FastifyBaseLogger, url: string, body: CurveSolverQuoteRequest): never {
  if (error instanceof FetchError) {
    log.error({ message: 'curve-solver route request failed', status: error.status, url, body })
  }
  throw error
}
