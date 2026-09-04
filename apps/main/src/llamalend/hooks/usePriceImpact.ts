import type { MarketToken } from '@/llamalend/llama.utils'
import type { RouteResponse } from '@evm-ui/entities/router-api'
import { combineQueries } from '@evm-ui/lib'
import { useTokenUsdRate } from '@evm-ui/lib/model/entities/token-usd-rate'
import { decimalMultiply, fromWei } from '@evm-ui/utils'
import type { PriceImpact } from '@evm-ui/widgets/DetailPageLayout/price-impact.util'
import { assert, maybe } from '@primitives/objects.utils'
import { q, type QueryProp } from '@ui/features/queries/util'
import { calculatePriceImpact } from './useMarketRoutes'

export const usePriceImpact = (
  {
    selectedRoute: route,
    tokenIn,
    tokenOut,
    chainId,
  }: {
    selectedRoute: RouteResponse | undefined
    tokenIn: MarketToken | undefined
    tokenOut: MarketToken | undefined
    chainId: number
  },
  enabled?: boolean,
): QueryProp<PriceImpact | null> => {
  const inUsdRate = q(useTokenUsdRate({ tokenAddress: tokenIn?.address, chainId }, enabled))
  const outUsdRate = q(useTokenUsdRate({ tokenAddress: tokenOut?.address, chainId }, enabled))

  const tokenInDecimals = tokenIn?.decimals
  const tokenOutDecimals = tokenOut?.decimals

  return combineQueries(
    [inUsdRate, outUsdRate],
    (tokenInUsdRate, tokenOutUsdRate) =>
      maybe(route, ({ amountIn, amountOut }) => {
        const inDecimals = assert(tokenInDecimals, 'TokenIn is required to calculate price impact')
        const outDecimals = assert(tokenOutDecimals, 'TokenOut is required to calculate price impact')
        return {
          priceImpact: calculatePriceImpact({
            selectedAmountIn: assert(amountIn[0], 'Route amountIn is required to calculate price impact'),
            selectedAmountOut: assert(amountOut[0], 'Route amountOut is required to calculate price impact'),
            tokenInDecimals: inDecimals,
            tokenOutDecimals: outDecimals,
            tokenInUsdRate: `${tokenInUsdRate}`,
            tokenOutUsdRate: `${tokenOutUsdRate}`,
          }),
          tokenInUsd: decimalMultiply(fromWei(amountIn[0], inDecimals), `${tokenInUsdRate}`),
        }
      }) ?? null,
  )
}
