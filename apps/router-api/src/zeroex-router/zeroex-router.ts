import { FastifyBaseLogger } from 'fastify'
import { FetchError, fetchJson } from '@primitives/fetch.utils'
import { assert, maybe } from '@primitives/objects.utils'
import type { RouteStep, RouterRouteResponse } from '@primitives/router.utils'
import { ROUTER_FEE_BPS, ROUTER_FEE_RECEIVER_BY_CHAIN_ID } from '../router-fees'
import { type RoutesQuery } from '../routes/routes.schemas'
import type { ZeroExQuoteRequest, ZeroExQuoteResponse } from './zeroex.types'

const { ZEROEX_API_URL = 'https://api.0x.org', ZEROEX_API_KEY } = process.env
const protocol = '0x' as const

async function getZeroExQuote({ chainId, ...params }: ZeroExQuoteRequest) {
  const quote = await fetchJson<ZeroExQuoteResponse>(
    `${ZEROEX_API_URL}/swap/allowance-holder/quote?${new URLSearchParams({ ...params, chainId: `${chainId}` })}`,
    { headers: { '0x-api-key': assert(ZEROEX_API_KEY, 'Missing 0x API KEY'), '0x-version': 'v2' } },
  )
  assert(quote.liquidityAvailable, `0x quote error - no liquidity available`)
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

  const params: ZeroExQuoteRequest = {
    chainId,
    sellToken,
    buyToken,
    sellAmount: amountIn,
    taker,
    ...maybe(ROUTER_FEE_RECEIVER_BY_CHAIN_ID[chainId], swapFeeRecipient => ({
      swapFeeRecipient,
      swapFeeBps: ROUTER_FEE_BPS,
      swapFeeToken: sellToken,
    })),
  }
  const { buyAmount, route, sellAmount, transaction } = await getZeroExQuote(params).catch(error =>
    logZeroExError(error, log, params),
  )
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

function logZeroExError(error: unknown, log: FastifyBaseLogger, params: Partial<ZeroExQuoteRequest>): never {
  if (error instanceof FetchError) {
    log.error({ message: '0x route request failed', status: error.status, params })
  }
  throw error
}
