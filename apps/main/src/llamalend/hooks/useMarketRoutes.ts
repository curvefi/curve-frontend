import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useConnection } from 'wagmi'
import { useOptimalRoute } from '@ui-kit/entities/router.query'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { type Query } from '@ui-kit/types/util'
import type { Address, Decimal } from '@ui-kit/utils'
import type { RouteOption, RouteProvider } from '@ui-kit/widgets/RouteProvider'

const ALL_ROUTE_PROVIDERS: RouteProvider[] = ['curve', 'odos', 'enso']

export type MarketRoutesQuery = Query<RouteOption[]> & {
  selected: RouteOption | undefined
  onChange: (route: RouteOption) => void
  onRefresh: () => void
}

export function useMarketRoutes({
  chainId,
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
  route,
  outputTokenSymbol,
  enabled,
  onChangeRoute,
}: {
  chainId: number
  tokenIn: Address | undefined
  tokenOut: Address | undefined
  amountIn: Decimal | undefined
  slippage: Decimal | undefined
  route: RouteOption | undefined | null
  outputTokenSymbol: string | undefined
  enabled: boolean
  onChangeRoute: (route: RouteOption) => void
}): MarketRoutesQuery | undefined {
  const { address: userAddress } = useConnection()
  const { data, refetch, isLoading, error } = useOptimalRoute(
    {
      chainId,
      tokenIn,
      tokenOut,
      amountIn,
      router: ALL_ROUTE_PROVIDERS,
      fromAddress: userAddress,
      slippage,
    },
    enabled,
  )
  const { data: outputTokenUsdRate } = useTokenUsdRate(
    {
      chainId,
      tokenAddress: tokenOut,
    },
    enabled && !!tokenOut,
  )

  const routes = useMemo(
    () =>
      data?.map((item) => ({
        provider: item.router,
        toAmountOutput: item.amountOut,
        priceImpact: item.priceImpact ?? 0,
        routerAddress: item.tx?.to ?? zeroAddress,
        calldata: item.tx?.data ?? '0x',
        usdPrice: outputTokenUsdRate ?? null,
      })),
    [outputTokenUsdRate, data],
  )
  const selected = routes?.find((next) => next.provider === route?.provider) ?? route ?? routes?.[0]

  console.log('useMarketRoutes', { routes, selected, enabled, tokenOut, outputTokenSymbol })
  return enabled
    ? {
        data: routes,
        isLoading,
        error,
        selected,
        onChange: onChangeRoute,
        onRefresh: () => refetch(),
      }
    : undefined
}
