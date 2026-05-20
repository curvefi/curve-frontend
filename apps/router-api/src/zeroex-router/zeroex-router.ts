import { FastifyBaseLogger } from 'fastify'
import { assert } from '@primitives/objects.utils'
import type { RouteStep, RouterRouteResponse } from '@primitives/router.utils'
import { type RoutesQuery } from '../routes/routes.schemas'
import type { ZeroExQuoteRequest, ZeroExQuoteResponse } from './zeroex.types'

const { ZEROEX_API_URL = 'https://api.0x.org', ZEROEX_API_KEY } = process.env
const protocol = '0x' as const

async function getZeroExQuote({ chainId, ...params }: ZeroExQuoteRequest, log: FastifyBaseLogger) {
  const response = await fetch(
    `${ZEROEX_API_URL}/swap/allowance-holder/quote?${new URLSearchParams({ ...params, chainId: `${chainId}` })}`,
    {
      method: 'GET',
      headers: { '0x-api-key': assert(ZEROEX_API_KEY, 'Missing 0x API KEY'), '0x-version': 'v2' },
    },
  )
  const { ok, status, statusText } = response
  if (!ok) {
    const body = await response.text()
    log.error({ message: '0x route request failed', status, statusText, params, body })
    throw new Error(`0x error - ${status} ${statusText}`)
  }
  const quote = (await response.json()) as ZeroExQuoteResponse
  if (!quote.liquidityAvailable) {
    log.error({ message: '0x quote error - no liquidity available', params, quote })
    throw new Error(`0x quote error - no liquidity available`)
  }
  return quote
}

/**
 * Calls 0x Swap API quote endpoint and builds a router-api compatible response.
 * Minimal MVP: exact-input only (sellAmount), executable tx mapping and route fills.
 */
export const buildZeroExRouteResponse = async (
  query: RoutesQuery,
  log: FastifyBaseLogger,
): Promise<RouterRouteResponse[]> => {
  const {
    chainId,
    tokenIn: [sellToken],
    tokenOut: [buyToken],
    amountIn: [amountIn] = [],
    userAddress: taker,
  } = query

  if (amountIn == null || !taker) {
    // 0x requires an exact-input sellAmount and taker/user address for executable transaction assembly.
    log.info({ message: '0x route request skipped, amountIn and userAddress are required', query })
    return []
  }

  const params: ZeroExQuoteRequest = { chainId, sellToken, buyToken, sellAmount: amountIn, taker }
  const { buyAmount, route, sellAmount, transaction } = await getZeroExQuote(params, log)
  const { data, gas, to, value } = transaction
  return [
    {
      router: protocol,
      amountIn: [sellAmount],
      amountOut: [buyAmount],
      gas,
      priceImpact: null,
      createdAt: Date.now(),
      warnings: [],
      isStableswapRoute: false,
      tx: { to, data, from: taker, value },
      route: route.fills.map(
        (fill): RouteStep => ({
          name: fill.source,
          tokenIn: [fill.from],
          tokenOut: [fill.to],
          protocol,
          action: 'swap',
          chainId,
          args: { source: fill.source, proportionBps: fill.proportionBps },
        }),
      ),
    },
  ]
}
