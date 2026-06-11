import { useEffect, useEffectEvent, useMemo, useState, useTransition } from 'react'
import { useConnection } from 'wagmi'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { Address } from '@primitives/address.utils'
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
  tokenIn: { symbol: string; address: Address; decimals: number } | undefined
  tokenOut: { symbol: string; address: Address; decimals: number } | undefined
  amountIn: Decimal | undefined
  slippage: Decimal | undefined
  enabled: boolean
  networks: Record<number, BaseConfig>
  getRouteGasOptions: GetGasCallback<TData, GasQueryKey>
  zapAddress: Address | undefined
  onChange: (option: RouteResponse | undefined) => Promise<void>
}): MarketRoutes | undefined {
  const [chosenRouter, setChosenRouter] = useState<RouteProvider | undefined>(undefined) // keep the preferred router while mounted
  const { address: userAddress } = useConnection()
  const [, startTransition] = useTransition() // todo: use isTransitioning for something

  const { queries, onRefresh } = useRouterQueries<TData, GasQueryKey>(
    {
      chainId,
      tokenIn: tokenIn?.address,
      tokenOut: tokenOut?.address,
      amountIn: amountIn && tokenIn && toWei(amountIn, tokenIn.decimals),
      userAddress,
      zapAddress,
      slippage,
    },
    getRouteGasOptions,
    enabled && !!slippage, // enforce slippage, important for ZapV2 but not required for API
  )
  const usdRate = q(useTokenUsdRate({ tokenAddress: tokenOut?.address, chainId }, enabled))
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

  return {
    networks,
    chainId,
    queries,
    enabled,
    selectedRoute,
    selectedRouter: chosenRouter ?? selectedRoute?.router,
    onChange: setChosenRouter,
    onRefresh,
    tokenOut: { ...tokenOut, usdRate },
  }
}
