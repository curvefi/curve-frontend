import { FastifyBaseLogger } from 'fastify'
import { Address } from 'viem'
import { toArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { RouterRouteResponse, TransactionData } from '@primitives/router.utils'
import { type RoutesQuery } from '../routes/routes.schemas'

const { ENSO_API_URL = 'https://api.enso.finance', ENSO_API_KEY } = process.env

type EnsoRouteResponse = {
  gas: string
  amountOut: Decimal
  priceImpact: number | null
  feeAmount: string[]
  minAmountOut: Decimal
  createdAt: number
  tx: TransactionData
  route: {
    tokenIn: [Address]
    tokenOut: [Address]
    protocol: string
    action: string
    primary?: string
    internalRoutes?: string[]
    args: Record<string, unknown>
    chainId: number
    sourceChainId?: number
    destinationChainId?: number
  }[]
  ensoFeeAmount: Decimal[]
}

/**
 * Calls Enso's router to get the optimal route and builds the response.
 */
export const buildEnsoRouteResponse = async (
  query: RoutesQuery,
  log: FastifyBaseLogger,
): Promise<RouterRouteResponse[]> => {
  const {
    chainId,
    tokenIn: [tokenIn],
    tokenOut: [tokenOut],
    amountIn: [amountIn] = [],
    amountOut: [minAmountOut] = [],
    userAddress,
  } = query

  if (amountIn == null || !userAddress) {
    // Enso requires amountIn and userAddress to be specified, no routes found otherwise
    log.info({ message: 'enso route request skipped, amountIn and userAddress are required', query })
    return []
  }

  const url = `${ENSO_API_URL}/api/v1/shortcuts/route?${new URLSearchParams({
    chainId: `${chainId}`,
    fromAddress: userAddress,
    ...(tokenIn && { tokenIn }),
    ...(tokenOut && { tokenOut }),
    ...(amountIn && { amountIn }),
    ...(minAmountOut && { minAmountOut }),
  })}`

  const response = await fetch(url, {
    method: 'GET',
    ...(ENSO_API_KEY && { headers: { Authorization: `Bearer ${ENSO_API_KEY}` } }),
  })
  const { ok, status, statusText } = response
  if (!ok) {
    const [message, body] = ['Enso route request failed', await response.text()]
    log.error({ message, status, statusText, url, body, authenticated: !!ENSO_API_KEY })
    return []
  }

  // Enso API is documented to return an array of routes, but in practice it returns a single object
  const json = (await response.json()) as EnsoRouteResponse | EnsoRouteResponse[]
  return toArray(json).map(
    ({ route, amountOut, ...routeProps }): RouterRouteResponse => ({
      router: 'enso',
      amountIn: [amountIn],
      amountOut: [amountOut],
      warnings: [], // legacy code seems to only use warnings for stableswap routes
      route: route.map(({ action, chainId: routeChainId, primary, protocol, ...stepProps }) => ({
        name: primary || `${protocol}:${action}`,
        chainId: routeChainId ?? chainId,
        protocol,
        action,
        primary,
        ...stepProps,
      })),
      ...routeProps,
    }),
  )
}
