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
  useRouterQueries,
} from '@ui-kit/entities/router-api'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketVersion } from '@ui-kit/types/market'
import { q, type QueryProp } from '@ui-kit/types/util'
import { Chain, decimalCompare, decimalMax, toWei } from '@ui-kit/utils'

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

const leverageZaps: Record<LlamaMarketVersion, Record<number, Address>> = {
  [LlamaMarketVersion.v1]: {
    [Chain.Ethereum]: '0x324c5f9F7A3015D91860aC6870dcE25d410Df3Dc',
    [Chain.Arbitrum]: '0x9577086c6E38d38359872F903Da201f1bdCc0323',
    [Chain.Optimism]: '0xE94d1fBF399c27CCBf0185b2Dd11Bf0FA0f0D95C',
    [Chain.Fraxtal]: '0x16C6521Dff6baB339122a0FE25a9116693265353',
    [Chain.Sonic]: '0xCA8d0747B5573D69653C3aC22242e6341C36e4b4',
  },
  [LlamaMarketVersion.v2]: {
    [Chain.Optimism]: '0xcfd71a5BC9c2215ca8878C1083EC9a3CE1F0fdEb',
  },
}

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
  version,
}: {
  chainId: number
  tokenIn: { symbol: string; address: Address; decimals: number } | undefined
  tokenOut: { symbol: string; address: Address; decimals: number } | undefined
  amountIn: Decimal | undefined
  slippage: Decimal | undefined
  enabled: boolean
  networks: Record<number, BaseConfig>
  getRouteGasOptions: GetGasCallback<TData, GasQueryKey>
  version: LlamaMarketVersion | undefined
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
      zapAddress: version && leverageZaps[version]?.[chainId],
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
