import { FastifyBaseLogger } from 'fastify'
import { noop } from 'lodash'
import { ethAddress, zeroAddress } from 'viem'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { FetchError, fetchJson } from '@primitives/fetch.utils'
import { assert, fromEntries } from '@primitives/objects.utils'
import type { RouterRouteResponse } from '@primitives/router.utils'
import { type RoutesQuery } from '../routes/routes.schemas'
import type { AssemblePathResponse, CurveOdosAssembleRequest } from './odos-assemble.types'
import type { CurveOdosQuoteRequest, OdosQuoteResponse } from './odos-quote.types'

const { ODOS_API_URL = 'https://prices.curve.finance/odos' } = process.env
const protocol = 'odos' as const

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
    userAddress,
  }: {
    chainId: number
    tokenIn: Address
    tokenOut: Address
    amountIn: Decimal
    blacklist: readonly Address[]
    slippage: number
    userAddress: Address
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
    caller_address: userAddress,
  } satisfies Omit<Record<keyof CurveOdosQuoteRequest, string>, 'blacklist'>)
  blacklist.forEach(address => params.append('blacklist', address))

  return await fetchJson<OdosQuoteResponse>(`${ODOS_API_URL}/v3/quote?${params}`).catch(error =>
    logOdosError(error, log, 'odos route request failed', fromEntries([...params.entries()])),
  )
}

async function assembleOdosQuote(
  { pathId, userAddress }: { pathId: string; userAddress: Address },
  log: FastifyBaseLogger,
) {
  const params: Record<keyof CurveOdosAssembleRequest, string> = { path_id: pathId, user: userAddress }
  return await fetchJson<AssemblePathResponse>(`${ODOS_API_URL}/assemble?${new URLSearchParams(params)}`)
    .catch(error => logOdosError(error, log, 'odos assemble request failed', params))
    .catch(noop) // assemble errors result in no tx data in response, but don't fail the whole request
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
    userAddress,
    slippage = 0.5,
  } = query

  if (amountIn == null || !userAddress) {
    // Odos requires amount (amountIn), caller_address (leverage zap) and blacklist (AMM/controller)
    log.info({ message: 'odos route request skipped', query })
    return []
  }
  const {
    outAmounts,
    gasEstimate,
    pathId,
    pathVizImage,
    priceImpact = null,
  } = await getOdosQuote({ chainId, tokenIn, tokenOut, amountIn, blacklist, slippage, userAddress }, log)
  const { transaction } =
    (await assembleOdosQuote({ pathId: assert(pathId, 'Odos quote missing pathId'), userAddress }, log)) ?? {}
  return [
    {
      router: protocol,
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
          protocol,
          action: 'swap',
          chainId,
          args: { pathId, pathVizImage },
        },
      ],
      ...(transaction && { tx: transaction }),
    },
  ]
}

function logOdosError(error: unknown, log: FastifyBaseLogger, message: string, params: Record<string, string>): never {
  if (error instanceof FetchError) {
    log.error({ message, status: error.status, params })
  }
  throw error
}
