import { FastifyBaseLogger } from 'fastify'
import { type Address, type Hex } from 'viem'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@primitives/network.utils'
import type { RouterRouteResponse, RouteStep } from '@primitives/router.utils'
import { type RoutesQuery } from '../routes/routes.schemas'

const protocol = 'curve-solver' as const

const CURVE_SOLVER_NETWORKS = {
  [Chain.Ethereum]: 'https://ethereum.router.curve.finance',
  [Chain.Gnosis]: 'https://gnosis.router.curve.finance',
  [Chain.Arbitrum]: 'https://arbitrum.router.curve.finance',
} as const satisfies Partial<Record<Chain, string>>

type CurveSolverQuoteRequest = {
  input_token: Address
  output_token: Address
  amount_in: Decimal
  exact: true
  receiver?: Address
  min_out?: Decimal
}

type CurveSolverDebugRoute = {
  pools: string[]
  pool_addresses: Address[]
  swap_addresses: Address[]
  swap_params: number[][]
  coins: [Address, Address][]
  selected: boolean
}

type CurveSolverQuoteResponse = {
  expected_out: Decimal
  gas_estimate: number
  router_address: Address
  calldata?: Hex
  debug: { routes: CurveSolverDebugRoute[] }
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
    userAddress,
  } = query

  if (!(chainId in CURVE_SOLVER_NETWORKS) || amountIn == null) {
    log.info({ message: 'curve-solver route request skipped', chainId, query })
    return []
  }

  const response = await getCurveSolverQuote(
    CURVE_SOLVER_NETWORKS[chainId as keyof typeof CURVE_SOLVER_NETWORKS],
    {
      input_token: tokenIn,
      output_token: tokenOut,
      amount_in: amountIn,
      exact: true,
      ...(userAddress && { receiver: userAddress, min_out: '0' as Decimal }),
    },
    log,
  )
  const { coins, pools, pool_addresses, swap_addresses, swap_params } =
    response.debug.routes.find(({ selected }) => selected) ?? {}
  return [
    {
      router: protocol,
      amountIn: [amountIn],
      amountOut: [response.expected_out],
      gas: `${response.gas_estimate}` as Decimal,
      priceImpact: null,
      createdAt: Date.now(),
      warnings: [],
      isStableswapRoute: false,
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
      ...(response.calldata &&
        response.router_address &&
        userAddress && {
          tx: {
            data: response.calldata,
            to: response.router_address,
            from: userAddress,
            value: '0' as Decimal,
          },
        }),
    },
  ]
}
