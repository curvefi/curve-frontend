import { BigNumber } from 'bignumber.js'
import { FastifyBaseLogger } from 'fastify'
import { isAddressEqual } from 'viem'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { FetchError, fetchJson } from '@primitives/fetch.utils'
import { assert, maybe, notFalsy } from '@primitives/objects.utils'
import type { RouterRouteResponse, RouteStep } from '@primitives/router.utils'
import {
  calculateFeePercentage,
  combineFeePercentages,
  ROUTER_FEE_BPS,
  ROUTER_FEE_RECEIVER_BY_CHAIN_ID,
} from '../router-fees'
import { type RoutesQuery } from '../routes/routes.schemas'
import type { ZeroExQuoteRequest, ZeroExQuoteResponse } from './zeroex.types'

const { ZEROEX_API_URL = 'https://api.0x.org', ZEROEX_API_KEY } = process.env
const PROTOCOL = '0x' as const

const getZeroExQuote = async ({ chainId, ...params }: ZeroExQuoteRequest) =>
  await fetchJson<ZeroExQuoteResponse>(
    `${ZEROEX_API_URL}/swap/allowance-holder/quote?${new URLSearchParams({ ...params, chainId: `${chainId}` })}`,
    { headers: { '0x-api-key': assert(ZEROEX_API_KEY, 'Missing 0x API KEY'), '0x-version': 'v2' } },
  )

/**
 * Normalizes 0x volume fees into one effective percentage.
 *
 * Unlike Enso, 0x can return fees in either the sell or buy token, so their raw amounts cannot be added together.
 * Sell-token fees are measured against `sellAmount`, buy-token fees are measured against the gross buy amount because
 * the returned `buyAmount` is net of those fees. The two rates are then compounded to account for fees applied on both
 * sides of the swap.
 */
function calculateZeroExFeePercentage(
  fees: ZeroExQuoteResponse['fees'],
  sellToken: Address,
  buyToken: Address,
  sellAmount: Decimal,
  buyAmount: Decimal,
): Decimal {
  const volumeFees = notFalsy(...(fees.integratorFees ?? []), fees.zeroExFee)
  assert(
    volumeFees.every(({ token }) => isAddressEqual(token, sellToken) || isAddressEqual(token, buyToken)),
    '0x quote returned a fee in an unsupported token',
  )
  const sellFeeAmounts = volumeFees.filter(({ token }) => isAddressEqual(token, sellToken)).map(({ amount }) => amount)
  const buyFeeAmounts = volumeFees.filter(({ token }) => isAddressEqual(token, buyToken)).map(({ amount }) => amount)
  const sellFeePercentage = calculateFeePercentage(sellFeeAmounts, sellAmount)
  const grossBuyAmount = new BigNumber(buyAmount).plus(BigNumber.sum(0, ...buyFeeAmounts)).toFixed() as Decimal
  const buyFeePercentage = calculateFeePercentage(buyFeeAmounts, grossBuyAmount)
  return combineFeePercentages(sellFeePercentage, buyFeePercentage)
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
    zapAddress: taker,
  } = query

  if (amountIn == null || !taker) {
    // 0x requires an exact-input sellAmount and taker/user address for executable transaction assembly.
    log.info({ message: '0x route request skipped, amountIn and zapAddress are required', query })
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
  const quote = await getZeroExQuote(params).catch(error => logZeroExError(error, log, params))
  if (!quote?.liquidityAvailable) {
    log.info({ message: '0x quote returned no liquidity', params, quote })
    return []
  }
  const { buyAmount, fees, route, sellAmount, transaction } = quote
  const { data, gas, to, value } = transaction
  return [
    {
      router: PROTOCOL,
      // TODO: research if the 0x fees can be calculated with only one token (sell or buy)
      routerFeePercentage: calculateZeroExFeePercentage(fees, sellToken, buyToken, sellAmount, buyAmount),
      amountIn: [sellAmount],
      amountOut: [buyAmount],
      gas,
      priceImpact: null,
      createdAt: Date.now(),
      warnings: [],
      isStableswapRoute: false,
      tx: { to, data, from: taker, value },
      route: route.fills.map((fill): RouteStep => ({
        name: fill.source,
        tokenIn: [fill.from],
        tokenOut: [fill.to],
        protocol: PROTOCOL,
        action: 'swap',
        chainId,
        args: { source: fill.source, proportionBps: fill.proportionBps },
      })),
    },
  ]
}

function logZeroExError(error: unknown, log: FastifyBaseLogger, params: Partial<ZeroExQuoteRequest>): never {
  if (error instanceof FetchError) {
    log.error({ message: '0x route request failed', status: error.status, params })
  }
  throw error
}
