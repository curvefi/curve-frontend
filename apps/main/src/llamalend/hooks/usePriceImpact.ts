import { useCallback } from 'react'
import type { MarketToken } from '@/llamalend/llama.utils'
import { type RouteResponse, type RoutesParams, useRouterApi } from '@evm-ui/entities/router-api'
import { useTokenUsdRate } from '@evm-ui/lib/model/entities/token-usd-rate'
import { mapQuery, q, type QueryProp } from '@evm-ui/types/util'
import { decimalDiv, decimalMultiply, fromWei, toWei } from '@evm-ui/utils'
import type { PriceImpact } from '@evm-ui/widgets/DetailPageLayout/price-impact.util'
import { assert, maybe, maybes } from '@primitives/objects.utils'
import { calculatePriceImpact } from './usePriceImpact.utils'

const REFERENCE_USD_PRICE = '0.1' as const

export const usePriceImpact = (
  {
    params,
    selectedRoute: route,
    tokenIn,
    tokenOut,
    chainId,
  }: {
    params: RoutesParams
    selectedRoute: RouteResponse | undefined
    tokenIn: MarketToken | undefined
    tokenOut: MarketToken | undefined
    chainId: number
  },
  enabled?: boolean,
): QueryProp<PriceImpact | null> => {
  const inUsdRate = q(useTokenUsdRate({ tokenAddress: tokenIn?.address, chainId }, enabled))

  const tokenInDecimals = tokenIn?.decimals
  const tokenOutDecimals = tokenOut?.decimals
  const tokenInUsd = maybes([route?.amountIn, tokenInDecimals, inUsdRate.data], ([amountIn], decimals, usdRate) =>
    decimalMultiply(fromWei(amountIn, decimals), `${usdRate}`),
  )
  const referenceAmountIn = maybes([inUsdRate.data, tokenInDecimals], (usdRate, decimals) =>
    toWei(decimalDiv(REFERENCE_USD_PRICE, `${usdRate}`), decimals),
  )
  const isEnabled = enabled && !!route && !!referenceAmountIn && tokenInDecimals != null && tokenOutDecimals != null

  return mapQuery(
    useRouterApi(
      {
        ...params,
        amountIn: referenceAmountIn,
        router: route?.router,
      },
      isEnabled,
    ),
    useCallback(
      ([referenceRoute]) =>
        maybe(referenceRoute, ({ amountIn, amountOut }) => ({
          priceImpact: calculatePriceImpact({
            selectedAmountIn: assert(route?.amountIn[0], 'Route data is required to calculate price impact'),
            selectedAmountOut: assert(route?.amountOut[0], 'Route data is required to calculate price impact'),
            tokenInDecimals: assert(tokenInDecimals, 'TokenIn is required to calculate price impact'),
            tokenOutDecimals: assert(tokenOutDecimals, 'TokenOut is required to calculate price impact'),
            referenceAmountIn: assert(amountIn[0], 'Reference amountIn is required to calculate price impact'),
            referenceAmountOut: assert(amountOut[0], 'Reference amountOut is required to calculate price impact'),
          }),
          tokenInUsd,
        })) ?? null,
      [route, tokenInDecimals, tokenOutDecimals, tokenInUsd],
    ),
  )
}
