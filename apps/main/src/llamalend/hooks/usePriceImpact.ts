import { useCallback } from 'react'
import type { MarketToken } from '@/llamalend/llama.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert, maybes } from '@primitives/objects.utils'
import { type RouteResponse, type RoutesParams, useRouterApi } from '@ui-kit/entities/router-api'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { mapQuery, q, type QueryProp } from '@ui-kit/types/util'
import { decimal, decimalDiv, decimalMax, decimalMinus, decimalMultiply, fromWei, toWei } from '@ui-kit/utils'
import type { PriceImpact } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'

const REFERENCE_USD_PRICE = '0.1' as const

const calculatePriceImpact = ({
  selectedAmountIn,
  selectedAmountOut,
  referenceAmountIn,
  referenceAmountOut,
  tokenInDecimals,
  tokenOutDecimals,
}: {
  selectedAmountIn: Decimal
  selectedAmountOut: Decimal
  referenceAmountIn: Decimal
  referenceAmountOut: Decimal
  tokenInDecimals: number
  tokenOutDecimals: number
}) => {
  const amountIn = fromWei(selectedAmountIn, tokenInDecimals)
  const amountOut = fromWei(selectedAmountOut, tokenOutDecimals)
  const referenceOut = fromWei(referenceAmountOut, tokenOutDecimals)
  const referenceIn = fromWei(referenceAmountIn, tokenInDecimals)
  const selectedRate = decimalDiv(amountOut, amountIn)
  const referenceRate = decimalDiv(referenceOut, referenceIn)
  const ratio = decimalDiv(selectedRate, referenceRate)
  const priceImpact = decimalMax('0', decimalMultiply(decimalMinus('1', ratio), '100'))
  return decimal(priceImpact)
}

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
  const tokenInUsd = maybes(
    [route?.amountIn, tokenInDecimals, inUsdRate.data],
    ([[amountIn], decimals, usdRate]: readonly [[`${number}`], number, number]) =>
      decimalMultiply(fromWei(amountIn, decimals), `${usdRate}`),
  )
  const referenceAmountIn = maybes(
    [inUsdRate.data, tokenInDecimals],
    ([usdRate, decimals]: readonly [number, number]) => toWei(decimalDiv(REFERENCE_USD_PRICE, `${usdRate}`), decimals),
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
      ([referenceRoute]): PriceImpact | null =>
        referenceRoute
          ? {
              priceImpact: calculatePriceImpact({
                selectedAmountIn: assert(route?.amountIn[0], 'Route data is required to calculate price impact'),
                selectedAmountOut: assert(route?.amountOut[0], 'Route data is required to calculate price impact'),
                tokenInDecimals: assert(tokenInDecimals, 'TokenIn is required to calculate price impact'),
                tokenOutDecimals: assert(tokenOutDecimals, 'TokenOut is required to calculate price impact'),
                referenceAmountIn: assert(
                  referenceRoute.amountIn[0],
                  'Reference is required to calculate price impact',
                ),
                referenceAmountOut: assert(
                  referenceRoute.amountOut[0],
                  'Reference is required to calculate price impact',
                ),
              }),
              tokenInUsd,
            }
          : null,
      [route, tokenInDecimals, tokenOutDecimals, tokenInUsd],
    ),
  )
}
