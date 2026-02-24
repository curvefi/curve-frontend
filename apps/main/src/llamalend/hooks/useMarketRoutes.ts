import { useEffect, useEffectEvent } from 'react'
import { useConnection } from 'wagmi'
import { useRouterApi } from '@ui-kit/entities/router-api.query'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { q, type Query, type QueryProp } from '@ui-kit/types/util'
import { type Address, type Decimal, toWei } from '@ui-kit/utils'
import { type RouteOption, RouteProviders } from '@ui-kit/widgets/RouteProvider'

export type MarketRoutes = Query<RouteOption[]> & {
  selectedRoute: RouteOption | undefined
  onChange: (option: RouteOption) => void
  onRefresh: () => void
  tokenOut: Partial<{ symbol: string | undefined; address: Address; decimals: number }> & { usdRate: QueryProp<number> }
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
  const usdRate = q(useTokenUsdRate({ tokenAddress: tokenOut?.address, chainId }))

  const firstRoute = data?.[0]
  const onChangeRoute = useEffectEvent(onChange)
  useEffect(() => {
    // todo: we really need a better way to add callbacks to queries that doesn't introduce extra renders
    if (firstRoute) onChangeRoute(firstRoute)
  }, [firstRoute])
  return enabled
    ? { data, isLoading, error, selectedRoute, onChange, onRefresh: refetch, tokenOut: { ...tokenOut, usdRate } }
    : undefined
}
