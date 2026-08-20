import { formatUnits } from 'ethers'
import type { GetExpectedFn } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { Address } from '@primitives/address.utils'
import { toArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert } from '@primitives/objects.utils'
import { isCurveRouterEnabled, isCurveSolverRouterEnabled } from '@ui-kit/hooks/useFeatureFlags'
import { getReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { Chain, ReleaseChannel } from '@ui-kit/utils'
import { fetchApiRoutes, getRouteById } from './router-api.query'
import type { RouteMeta, RouteMutationMeta, RoutesQuery } from './router-api.types'

/**
 * Maximum router calldata accepted by ZapV2. Larger payloads exceed its fixed 9,600-byte buffer and deterministically
 * revert. LlamaLend.js also adds roughly 200 bytes of metadata, leaving 9,400 bytes safely available to routers.
 */
const MAX_ZAP_V2_ROUTER_CALLDATA_BYTES = 9_400

/**
 * Checks the ZapV2 router calldata limit. Hex calldata starts with `0x` and uses two hex characters per byte, so the
 * prefix is removed before dividing the remaining character count by two.
 */
export const isZapV2RouterCalldataTooLarge = (calldata: string | undefined) =>
  !!calldata && (calldata.length - 2) / 2 > MAX_ZAP_V2_ROUTER_CALLDATA_BYTES

/**
 * Converts a cached router route into the minimal zapV2 payload expected by llamalend.js.
 */
export const parseRoute = (routeId: string | undefined): RouteMeta => {
  const route = getRouteById(routeId)
  const releaseChannel = getReleaseChannel()
  assert(
    (route.router !== 'curve' || isCurveRouterEnabled(releaseChannel)) &&
      (route.router !== 'curve-solver' || isCurveSolverRouterEnabled(releaseChannel)),
    'Curve routes are only available in Beta',
  )
  const {
    tx,
    amountOut: [outAmount],
    priceImpact,
  } = route
  const { to, data } = assert(tx, `No transaction information for route ${routeId}`)
  /* Enso returns no price impact when it has no usd price, the library will be updated to accept null */
  const quote = { outAmount, priceImpact: priceImpact! }
  return { router: to, calldata: data, quote }
}

/**
 * Like parseRoute, but also computes minRecv from outAmount and slippage.
 * minRecv = outAmount * (100 - slippage) / 100
 */
export const parseMutationRoute = (
  market: MintMarketTemplate | LendMarketTemplate,
  { routeId, slippage, isRepay }: { routeId: string | undefined; slippage: Decimal; isRepay: boolean },
): RouteMutationMeta => {
  const route = parseRoute(routeId)
  const zapV2 = assert(market.leverageZapV2, `Invalid market template ${market.id}`)
  const decimals = market.coinDecimals[isRepay ? 0 : 1] // outCoin is borrow for repay, collateral otherwise
  const expected = formatUnits(BigInt(route.quote.outAmount), decimals)
  return { ...route, minRecv: zapV2.calcMinRecv(expected, Number(slippage)) }
}

/**
 * The curve-solver router supports more coins and routes than the curve router, e.g., sUSDe.
 * However, it doesn't support all chains such as Optimism. So in those cases, we prefer the curve router.
 */
const SOLVER_CHAINS = [Chain.Ethereum, Chain.Arbitrum] as const

export const getDefaultRouteProvider = (chainId: number, releaseChannel: ReleaseChannel) =>
  isCurveRouterEnabled(releaseChannel)
    ? isCurveSolverRouterEnabled(releaseChannel) && SOLVER_CHAINS.includes(chainId)
      ? 'curve-solver'
      : 'curve'
    : 'enso'

/**
 * This function can be used as a callback for curve-js calldata methods or llamalend.js leverageZapV2 methods.
 */
export const getExpectedFn = ({
  chainId,
  router = getDefaultRouteProvider(chainId, getReleaseChannel()), // router is unset when checking the max borrow
  userAddress,
  zapAddress,
  slippage,
}: Pick<RoutesQuery, 'chainId' | 'router' | 'slippage' | 'userAddress' | 'zapAddress'>): GetExpectedFn => {
  const releaseChannel = getReleaseChannel()
  assert(
    toArray(router).every(
      provider =>
        (provider !== 'curve' || isCurveRouterEnabled(releaseChannel)) &&
        (provider !== 'curve-solver' || isCurveSolverRouterEnabled(releaseChannel)),
    ),
    'Curve routes are only available in Beta',
  )
  return async (tokenIn, tokenOut, amountIn, blacklist) => {
    const routes = await fetchApiRoutes({
      chainId,
      tokenIn: tokenIn as Address,
      tokenOut: tokenOut as Address,
      amountIn: `${amountIn}` as Decimal,
      blacklist: toArray(blacklist as Address | readonly Address[]),
      router,
      slippage,
      userAddress,
      zapAddress,
    })
    const route = assert(routes?.[0], 'No route available')
    return parseRoute(route.id).quote
  }
}

export const createHash = async (
  input: (number | string | null | undefined | readonly number[] | readonly string[])[],
  algorithm = 'SHA-256',
): Promise<string> =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest(
        algorithm,
        new TextEncoder().encode(input.map(v => toArray<number | string>(v).join(',')).join('-')),
      ),
    ),
  )
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
