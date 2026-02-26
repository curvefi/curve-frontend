import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { useConnection } from 'wagmi'
import { Address } from '@primitives/address.utils'
import { Decimal } from '@primitives/decimal.utils'
import { type RouteProvider, RouteProviders } from '@primitives/router.utils'
import { useRouterApi } from '@ui-kit/entities/router-api.query'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { q, type Query, type QueryProp } from '@ui-kit/types/util'
import { toWei } from '@ui-kit/utils'
import { type RouteOption } from '@ui-kit/widgets/RouteProvider'

export type MarketRoutes = Query<RouteOption[]> & {
  selectedRoute: RouteOption | undefined
  onChange: (option: RouteOption | undefined) => Promise<void>
  onRefresh: () => void
  tokenOut: Partial<{ symbol: string | undefined; address: Address; decimals: number }> & { usdRate: QueryProp<number> }
}

export function useMarketRoutes({
  chainId,
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
  routeId,
  enabled,
  onChange: onChangeProp,
}: {
  chainId: number
  tokenIn: { symbol: string; address: Address; decimals: number } | undefined
  tokenOut: { symbol: string; address: Address; decimals: number } | undefined
  amountIn: Decimal | undefined
  slippage: Decimal | undefined
  routeId: string | undefined
  enabled: boolean
} & Pick<MarketRoutes, 'onChange'>): MarketRoutes | undefined {
  const [chosenRouter, setChosenRouter] = useState<RouteProvider | undefined>(undefined) // keep the preferred router while mounted
  const { address: userAddress } = useConnection()
  const params = {
    chainId,
    tokenIn: tokenIn?.address,
    tokenOut: tokenOut?.address,
    amountIn: amountIn && tokenIn && toWei(amountIn, tokenIn.decimals),
    router: RouteProviders,
    userAddress,
    slippage,
  }
  const { data, refetch, isLoading, error } = useRouterApi(params, enabled)
  const usdRate = q(useTokenUsdRate({ tokenAddress: tokenOut?.address, chainId }))

  const selectedRoute =
    (routeId && data?.find(({ id }) => id === routeId)) ||
    (chosenRouter && data?.find(({ router }) => router === chosenRouter)) ||
    data?.[0]
  const onChangeEffect = useEffectEvent(onChangeProp)
  const onChange = useCallback(
    async (option: RouteOption | undefined) => {
      if (option) setChosenRouter(option?.router)
      await onChangeProp(option)
    },
    [onChangeProp],
  )
  useEffect(() => void onChangeEffect(selectedRoute), [selectedRoute])

  return enabled
    ? { data, isLoading, error, selectedRoute, onChange, onRefresh: refetch, tokenOut: { ...tokenOut, usdRate } }
    : undefined
}
