import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { usePriceImpact } from '@/llamalend/hooks/usePriceImpact'
import type { MarketToken } from '@/llamalend/llama.utils'
import type { TGas } from '@curvefi/llamalend-api/lib/interfaces'
import {
  type GetGasCallback,
  type RouteQueries,
  type RouteResponse,
  usePinRouteById,
  useRouterQueries,
} from '@evm-ui/entities/router-api'
import { useTokenUsdRate } from '@evm-ui/lib/model/entities/token-usd-rate'
import { q, type QueryProp } from '@evm-ui/types/util'
import { decimalCompare, decimalMax, toWei, decimalDiv, decimalMinus, decimalMultiply, fromWei } from '@evm-ui/utils'
import type { PriceImpact } from '@evm-ui/widgets/DetailPageLayout/price-impact.util'
import type { NetworkDef } from '@legacy-ui/utils'
import { Address } from '@primitives/address.utils'
import { toArray } from '@primitives/array.utils'
import { Decimal } from '@primitives/decimal.utils'
import { maybe, notFalsy, recordValues } from '@primitives/objects.utils'
import { type RouteProvider, type RouterRouteResponse } from '@primitives/router.utils'
import type { QueryKey } from '@tanstack/react-query'

export type MarketRoutes = {
  queries: RouteQueries
  enabled: boolean
  selectedRoute: RouteResponse | undefined
  selectedRouter: RouteProvider | undefined
  onChange: (option: RouteProvider | undefined) => void
  onRefresh: () => Promise<unknown>
  tokenOut: Partial<{ symbol: string | undefined; address: Address; decimals: number }> & { usdRate: QueryProp<number> }
  networks: Record<number, NetworkDef>
  chainId: number
  providers: readonly RouteProvider[]
}

const sortRoutes = (a: RouterRouteResponse, b: RouterRouteResponse) =>
  decimalCompare(decimalMax(...b.amountOut) ?? '0', decimalMax(...a.amountOut) ?? '0') ||
  (a.priceImpact ?? 100) - (b.priceImpact ?? 100)

export const calculatePriceImpact = ({
  selectedAmountIn,
  selectedAmountOut,
  tokenInDecimals,
  tokenOutDecimals,
  tokenInUsdRate,
  tokenOutUsdRate,
}: {
  selectedAmountIn: Decimal
  selectedAmountOut: Decimal
  tokenInDecimals: number
  tokenOutDecimals: number
  tokenInUsdRate: Decimal
  tokenOutUsdRate: Decimal
}) => {
  const amountInUsd = decimalMultiply(fromWei(selectedAmountIn, tokenInDecimals), tokenInUsdRate)
  const amountOutUsd = decimalMultiply(fromWei(selectedAmountOut, tokenOutDecimals), tokenOutUsdRate)
  const ratio = decimalDiv(amountOutUsd, amountInUsd)
  return decimalMax('0', decimalMultiply(decimalMinus('1', ratio), '100'))
}

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
  providers,
}: {
  chainId: number
  marketAddress: Address | undefined
  tokenIn: MarketToken | undefined
  tokenOut: MarketToken | undefined
  amountIn: Decimal | undefined
  slippage: Decimal | undefined
  enabled: boolean
  networks: Record<number, NetworkDef>
  getRouteGasOptions: GetGasCallback<TData, GasQueryKey>
  zapAddress: Address | undefined
  providers: readonly RouteProvider[] | undefined
  onChange: (option: RouteResponse | undefined) => Promise<void>
}): { routes: MarketRoutes | undefined; priceImpact?: QueryProp<PriceImpact | Decimal | null> } {
  const [chosenRouter, setChosenRouter] = useState<RouteProvider | undefined>(undefined) // keep the preferred router while mounted
  const { address: userAddress } = useConnection()

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
  const routesEnabled = enabled && !!providers?.length
  const { queries, onRefresh } = useRouterQueries<TData, GasQueryKey>(
    params,
    getRouteGasOptions,
    providers,
    routesEnabled && !!slippage, // enforce slippage, important for ZapV2 but not required for API
  )

  // Disabled providers can retain cached query data after switching release channels, so exclude them from selection.
  const selectedRoute = useMemo(
    () =>
      chosenRouter && queries[chosenRouter].enabled
        ? (queries[chosenRouter].data ?? undefined)
        : notFalsy(
            ...recordValues(queries)
              .filter(q => q.enabled)
              .map(q => q.data),
          )
            // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
            .sort(sortRoutes)[0],
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [chosenRouter, ...recordValues(queries)],
  )

  usePinRouteById(selectedRoute?.id)

  const onChangeEffect = useEffectEvent(onChangeProp)
  useEffect(() => void onChangeEffect(selectedRoute), [selectedRoute])

  const selectedRouter = chosenRouter && queries[chosenRouter].enabled ? chosenRouter : selectedRoute?.router
  const priceImpact = usePriceImpact({ selectedRoute, tokenIn, tokenOut, chainId }, routesEnabled)
  const tokenOutUsdRate = q(useTokenUsdRate({ tokenAddress: tokenOut?.address, chainId }, enabled))

  return {
    routes: maybe(providers, providers => ({
      networks,
      chainId,
      providers,
      queries,
      enabled: routesEnabled,
      selectedRoute,
      selectedRouter,
      onChange: setChosenRouter,
      onRefresh,
      tokenOut: { ...tokenOut, usdRate: tokenOutUsdRate },
    })),
    ...(enabled && { priceImpact }),
  }
}
