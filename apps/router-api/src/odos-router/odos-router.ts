import { FastifyBaseLogger } from 'fastify'
import { type Address } from 'viem'
import { type Decimal, type RoutesQuery, type RouteResponse } from '../routes/routes.schemas'
import type { AssemblePathResponse, CurveOdosAssembleRequest } from './odos-assemble.types'
import type { CurveOdosQuoteRequest, OdosQuoteResponse } from './odos-quote.types'

const { ODOS_API_URL = 'https://prices.curve.finance/odos' } = process.env

async function getOdosQuote(
  {
    chainId,
    tokenIn,
    tokenOut,
    amountIn,
    slippage,
    fromAddress,
  }: {
    chainId: number
    tokenIn: Address
    tokenOut: Address
    amountIn: Decimal
    slippage: number
    fromAddress: Address
  },
  log: FastifyBaseLogger,
) {
  const params: Record<keyof CurveOdosQuoteRequest, string> = {
    chain_id: `${chainId}`,
    from_address: tokenIn,
    to_address: tokenOut,
    amount: amountIn,
    slippage: `${slippage}`,
    pathVizImage: 'false',
    caller_address: fromAddress,
    blacklist: '',
  }

  const quoteResponse = await fetch(`${ODOS_API_URL}/quote?${new URLSearchParams(params)}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
  })

  const { ok, status, statusText } = quoteResponse
  if (!ok) {
    log.error({ message: 'odos route request failed', status, statusText, params })
    throw new Error(`Odos quote error - ${status} ${statusText}`)
  }

  return (await quoteResponse.json()) as OdosQuoteResponse
}

async function assembleOdosQuote(
  { pathId, fromAddress }: { pathId: string | null | undefined; fromAddress: string },
  log: FastifyBaseLogger,
) {
  if (!pathId) return
  const params: Record<keyof CurveOdosAssembleRequest, string> = { path_id: pathId, user: fromAddress }
  const assembleResponse = await fetch(`${ODOS_API_URL}/assemble?${new URLSearchParams(params)}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
  })
  const { ok, status, statusText } = assembleResponse
  if (!ok) {
    log.error({ message: 'odos assemble request failed', status, statusText, params })
    throw new Error(`Odos assemble error - ${status} ${statusText}`)
  }
  return (await assembleResponse.json()) as AssemblePathResponse
}

/**
 * Calls Odos (via prices API) to get a quote and builds the router-api response.
 * - Uses GET /odos/quote on the configured ODOS_API_URL (defaults to https://prices.curve.finance)
 */
export const buildOdosRouteResponse = async (query: RoutesQuery, log: FastifyBaseLogger): Promise<RouteResponse[]> => {
  const {
    chainId,
    tokenIn: [tokenIn],
    tokenOut: [tokenOut],
    amountIn: [amountIn] = [],
    fromAddress,
    slippage = 0.5,
  } = query

  if (amountIn == null || !fromAddress) {
    // Odos requires amount (amountIn), caller_address (leverage zap) and blacklist (AMM/controller)
    log.info({ message: 'odos route request skipped', query })
    return []
  }
  const {
    outAmounts,
    pathId,
    pathVizImage,
    priceImpact = null,
  } = await getOdosQuote({ chainId, tokenIn, tokenOut, amountIn, slippage, fromAddress }, log)

  const tx = await assembleOdosQuote({ pathId, fromAddress }, log)

  return [
    {
      router: 'odos',
      amountIn: [amountIn],
      amountOut: outAmounts as [Decimal],
      priceImpact,
      createdAt: Date.now(),
      warnings: [],
      isStableswapRoute: false,
      route: [
        {
          name: 'Odos route',
          tokenIn: [tokenIn],
          tokenOut: [tokenOut],
          protocol: 'odos',
          action: 'swap',
          chainId,
          args: {
            pathId: pathId,
            pathVizImage: pathVizImage,
          },
        },
      ],
      ...(tx?.transaction && { tx: tx.transaction }),
    },
  ]
}
