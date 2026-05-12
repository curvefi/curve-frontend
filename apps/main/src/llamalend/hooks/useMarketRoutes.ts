import { useCallback, useEffect, useEffectEvent, useMemo, useState, useTransition } from 'react'
import { decimalCompare, decimalMax } from 'router-api/src/router.utils'
import { useConnection } from 'wagmi'
import { Address } from '@primitives/address.utils'
import { Decimal } from '@primitives/decimal.utils'
import { type RouteProvider, type RouterRouteResponse } from '@primitives/router.utils'
import type { BaseConfig } from '@ui/utils'
import { type RouteQueries, type RouteResponse, useRouterQueries } from '@ui-kit/entities/router-api'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { q, type QueryProp } from '@ui-kit/types/util'
import { toWei } from '@ui-kit/utils'

export type MarketRoutes = {
  queries: RouteQueries
  sortedRoutes: RouteResponse[]
  enabled: boolean
  selectedRoute: RouteResponse | undefined
  onChange: (option: RouteResponse | undefined) => Promise<void>
  onRefresh: () => void
  tokenOut: Partial<{ symbol: string | undefined; address: Address; decimals: number }> & { usdRate: QueryProp<number> }
  networks: Record<number, BaseConfig>
  chainId: number
}

const sortRoutes = (a: RouterRouteResponse, b: RouterRouteResponse) =>
  decimalCompare(decimalMax(...b.amountOut) ?? '0', decimalMax(...a.amountOut) ?? '0') ||
  (a.priceImpact ?? 100) - (b.priceImpact ?? 100)

/**
 * Queries and converts the routes for leveraging on llamalend markets.
 */
export function useMarketRoutes({
  chainId,
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
  enabled,
  onChange: onChangeProp,
  networks,
}: {
  chainId: number
  tokenIn: { symbol: string; address: Address; decimals: number } | undefined
  tokenOut: { symbol: string; address: Address; decimals: number } | undefined
  amountIn: Decimal | undefined
  slippage: Decimal | undefined
  enabled: boolean
  networks: Record<number, BaseConfig>
} & Pick<MarketRoutes, 'onChange'>): MarketRoutes | undefined {
  const [chosenRouter, setChosenRouter] = useState<RouteProvider | undefined>(undefined) // keep the preferred router while mounted
  const { address: userAddress } = useConnection()
  const [, startTransition] = useTransition() // todo: use isTransitioning for something

  const { queries, onRefresh } = useRouterQueries(
    {
      chainId,
      tokenIn: tokenIn?.address,
      tokenOut: tokenOut?.address,
      amountIn: amountIn && tokenIn && toWei(amountIn, tokenIn.decimals),
      userAddress,
      slippage,
    },
    enabled && !!slippage, // enforce slippage, important for ZapV2 but not required for API
  )
  const usdRate = q(useTokenUsdRate({ tokenAddress: tokenOut?.address, chainId }, enabled))

  const sortedRoutes = useMemo(
    () =>
      [queries.curve, queries.enso, queries.odos]
        .map(q => q.data)
        .filter((q): q is RouteResponse => !!q)
        .sort(sortRoutes),
    [queries.curve, queries.enso, queries.odos],
  )

  const selectedRoute = (chosenRouter && queries[chosenRouter]?.data) || sortedRoutes?.[0]

  const onChangeEffect = useEffectEvent(onChangeProp)
  useEffect(() => startTransition(() => onChangeEffect(selectedRoute)), [selectedRoute])

  const onChange = useCallback(
    async (option: RouteResponse | undefined) => {
      if (option) setChosenRouter(option?.router)
      await onChangeProp(option)
    },
    [onChangeProp],
  )

  return {
    networks,
    chainId,
    queries,
    sortedRoutes,
    enabled,
    selectedRoute,
    onChange,
    onRefresh,
    tokenOut: { ...tokenOut, usdRate },
  }
}
