import { FastifyBaseLogger } from 'fastify'
import { ethAddress, zeroAddress } from 'viem'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert } from '@primitives/objects.utils'
import type { RouterRouteResponse } from '@primitives/router.utils'
import { type RoutesQuery } from '../routes/routes.schemas'
import type { AssemblePathResponse, CurveOdosAssembleRequest } from './odos-assemble.types'
import type { CurveOdosQuoteRequest, OdosQuoteResponse } from './odos-quote.types'

const { ODOS_API_URL = 'https://prices.curve.finance/odos' } = process.env
const PROTOCOL = 'odos' as const

/** Odos expects the zero address for ETH */
const getToken = (address: Address): Address => (address == ethAddress ? zeroAddress : address)

async function getOdosQuote(
  {
    chainId,
    tokenIn,
    tokenOut,
    amountIn,
    blacklist,
    slippage,
    zapAddress,
  }: {
    chainId: number
    tokenIn: Address
    tokenOut: Address
    amountIn: Decimal
    blacklist: readonly Address[]
    slippage: number
    zapAddress: Address
  },
  log: FastifyBaseLogger,
) {
  const params = new URLSearchParams({
    chain_id: `${chainId}`,
    from_address: getToken(tokenIn),
    to_address: getToken(tokenOut),
    amount: amountIn,
    slippage: `${slippage}`,
    pathVizImage: 'false', // prices API isn't returning images, maybe we could use them instead of `generateId`
    caller_address: zapAddress,
  } satisfies Omit<Record<keyof CurveOdosQuoteRequest, string>, 'blacklist'>)
  blacklist.forEach(address => params.append('blacklist', address))

  const quoteResponse = await fetch(`${ODOS_API_URL}/v3/quote?${params}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
  })

  const { ok, status, statusText } = quoteResponse
  if (!ok) {
    log.error({ message: 'odos route request failed', status, statusText, params, body: await quoteResponse.text() })
    throw new Error(`Odos quote error - ${status} ${statusText}`)
  }

  return (await quoteResponse.json()) as OdosQuoteResponse
}

async function assembleOdosQuote(
  { pathId, zapAddress }: { pathId: string; zapAddress: Address },
  log: FastifyBaseLogger,
) {
  const params: Record<keyof CurveOdosAssembleRequest, string> = { path_id: pathId, user: zapAddress }
  const assembleResponse = await fetch(`${ODOS_API_URL}/assemble?${new URLSearchParams(params)}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
  })
  const { ok, status, statusText } = assembleResponse
  if (!ok) {
    return log.error({
      message: 'odos assemble request failed',
      status,
      statusText,
      params,
      body: await assembleResponse.text(),
    })
  }
  return (await assembleResponse.json()) as AssemblePathResponse
}

/**
 * Calls Odos (via prices API) to get a quote and builds the router-api response.
 * - Uses GET /odos/quote on the configured ODOS_API_URL (defaults to https://prices.curve.finance)
 */
export const buildOdosRouteResponse = async (
  query: RoutesQuery,
  log: FastifyBaseLogger,
): Promise<RouterRouteResponse[]> => {
  const {
    chainId,
    tokenIn: [tokenIn],
    tokenOut: [tokenOut],
    blacklist = [],
    amountIn: [amountIn] = [],
    zapAddress,
    slippage = 0.5,
  } = query

  if (amountIn == null || !zapAddress) {
    // Odos requires amount (amountIn), caller_address (zapAddress) and blacklist (AMM/controller)
    log.info({ message: 'odos route request skipped', query })
    return []
  }
  const {
    outAmounts,
    gasEstimate,
    pathId,
    pathVizImage,
    priceImpact = null,
  } = await getOdosQuote({ chainId, tokenIn, tokenOut, amountIn, blacklist, slippage, zapAddress }, log)
  const { transaction } =
    (await assembleOdosQuote({ pathId: assert(pathId, 'Odos quote missing pathId'), zapAddress }, log)) ?? {}
  return [
    {
      router: PROTOCOL,
      amountIn: [amountIn],
      amountOut: outAmounts as [Decimal],
      priceImpact,
      gas: `${gasEstimate}`,
      createdAt: Date.now(),
      warnings: [],
      isStableswapRoute: false,
      route: [
        {
          name: 'Odos route',
          tokenIn: [tokenIn],
          tokenOut: [tokenOut],
          protocol: PROTOCOL,
          action: 'swap',
          chainId,
          args: { pathId, pathVizImage },
        },
      ],
      ...(transaction && { tx: transaction }),
    },
  ]
}
