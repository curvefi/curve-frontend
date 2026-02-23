import { useEffect, useEffectEvent, useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useConnection } from 'wagmi'
import { useRouterApi } from '@ui-kit/entities/router-api.query'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { type Query } from '@ui-kit/types/util'
import { type Address, type Decimal, fromWei, toWei } from '@ui-kit/utils'
import { type RouteOption, RouteProviders } from '@ui-kit/widgets/RouteProvider'

export type MarketRoutes = Query<RouteOption[]> & {
  selectedRoute: RouteOption | undefined
  onChange: (option: RouteOption) => void
  onRefresh: () => void
}

export function useMarketRoutes({
  chainId,
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
  selectedRoute,
  enabled,
  onChange,
}: {
  chainId: number
  tokenIn: { symbol: string; address: Address; decimals: number } | undefined
  tokenOut: { symbol: string; address: Address; decimals: number } | undefined
  amountIn: Decimal | undefined
  slippage: Decimal | undefined
  selectedRoute: RouteOption | undefined
  enabled: boolean
} & Pick<MarketRoutes, 'onChange'>): MarketRoutes | undefined {
  const { address: userAddress } = useConnection()
  const params = {
    chainId,
    tokenIn: tokenIn?.address,
    tokenOut: tokenOut?.address,
    amountIn: amountIn && tokenIn && toWei(amountIn, tokenIn.decimals),
    router: RouteProviders,
    fromAddress: userAddress,
    slippage,
  }
  const { data, refetch, isLoading, error } = useRouterApi(params, enabled)
  const { data: outputTokenUsdRate } = useTokenUsdRate(
    { chainId, tokenAddress: tokenOut?.address },
    enabled && !!tokenOut,
  )

  const routes = useMemo(
    () =>
      tokenOut &&
      data?.map((item) => ({
        id: item.id,
        provider: item.router,
        toAmountOutput: fromWei(item.amountOut, tokenOut.decimals),
        priceImpact: item.priceImpact ?? 0,
        routerAddress: item.tx?.to ?? zeroAddress,
        calldata: item.tx?.data ?? '0x',
        usdPrice: outputTokenUsdRate ?? null,
      })),
    [data, tokenOut, outputTokenUsdRate],
  )
  const firstRoute = routes?.[0]
  const onChangeRoute = useEffectEvent(onChange)
  useEffect(() => {
    // todo: we really need a better way to add callbacks to queries that doesn't introduce extra renders
    if (firstRoute) onChangeRoute(firstRoute)
  }, [firstRoute])

  return enabled ? { data: routes, isLoading, error, selectedRoute, onChange, onRefresh: refetch } : undefined
}
