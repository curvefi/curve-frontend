import { useEffect, useEffectEvent, useMemo, useState, useTransition } from 'react'
import { useConnection } from 'wagmi'
import { usePriceImpact } from '@/llamalend/hooks/usePriceImpact'
import type { MarketToken } from '@/llamalend/llama.utils'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { Address } from '@primitives/address.utils'
import { toArray } from '@primitives/array.utils'
import { Decimal } from '@primitives/decimal.utils'
import { recordValues } from '@primitives/objects.utils'
import { type RouteProvider, type RouterRouteResponse } from '@primitives/router.utils'
import type { QueryKey } from '@tanstack/react-query'
import type { BaseConfig } from '@ui/utils'
import {
  type GetGasCallback,
  type RouteQueries,
  type RouteResponse,
  usePinRouteById,
  useRouterQueries,
} from '@ui-kit/entities/router-api'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { q, type QueryProp } from '@ui-kit/types/util'
import { decimalCompare, decimalMax, toWei } from '@ui-kit/utils'
import type { PriceImpact } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'

export type MarketRoutes = {
  queries: RouteQueries
  enabled: boolean
  selectedRoute: RouteResponse | undefined
  selectedRouter: RouteProvider | undefined
  onChange: (option: RouteProvider | undefined) => void
  onRefresh: () => Promise<unknown>
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
export function useMarketRoutes<TData extends TGas | null, GasQueryKey extends QueryKey>({
  chainId,
  marketAddress,
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
  enabled,
  onChange: onChangeProp,
  networks,
  getRouteGasOptions,
  zapAddress,
}: {
  chainId: number
  marketAddress: Address | undefined
  tokenIn: MarketToken | undefined
  tokenOut: MarketToken | undefined
  amountIn: Decimal | undefined
  slippage: Decimal | undefined
  enabled: boolean
  networks: Record<number, BaseConfig>
  getRouteGasOptions: GetGasCallback<TData, GasQueryKey>
  zapAddress: Address | undefined
  onChange: (option: RouteResponse | undefined) => Promise<void>
}): { routes: MarketRoutes | undefined; priceImpact?: QueryProp<PriceImpact | Decimal | null> } {
  const [chosenRouter, setChosenRouter] = useState<RouteProvider | undefined>(undefined) // keep the preferred router while mounted
  const { address: userAddress } = useConnection()
  const [, startTransition] = useTransition() // todo: use isTransitioning for something

  const params = {
    chainId,
    tokenIn: tokenIn?.address,
    tokenOut: tokenOut?.address,
    amountIn: amountIn && tokenIn && toWei(amountIn, tokenIn.decimals),
    blacklist: toArray(marketAddress),
    userAddress,
    zapAddress,
    slippage,
  }
  const { queries, onRefresh } = useRouterQueries<TData, GasQueryKey>(
    params,
    getRouteGasOptions,
    enabled && !!slippage, // enforce slippage, important for ZapV2 but not required for API
  )

  const selectedRoute = useMemo(
    () =>
      chosenRouter
        ? (queries[chosenRouter].data ?? undefined)
        : recordValues(queries)
            .map(q => q.data)
            .filter((q): q is RouteResponse => !!q)
            .sort(sortRoutes)[0],
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [chosenRouter, ...recordValues(queries)],
  )

  usePinRouteById(selectedRoute?.id)

  const onChangeEffect = useEffectEvent(onChangeProp)
  useEffect(() => startTransition(() => onChangeEffect(selectedRoute)), [selectedRoute])

  const selectedRouter = chosenRouter ?? selectedRoute?.router
  const priceImpact = usePriceImpact({ params, selectedRoute, tokenIn, tokenOut, chainId }, enabled)

  return {
    routes: {
      networks,
      chainId,
      queries,
      enabled,
      selectedRoute,
      selectedRouter,
      onChange: setChosenRouter,
      onRefresh,
      tokenOut: { ...tokenOut, usdRate: q(useTokenUsdRate({ tokenAddress: tokenOut?.address, chainId }, enabled)) },
    },
    ...(enabled && { priceImpact }),
  }
}
