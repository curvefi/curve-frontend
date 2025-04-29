import { useMemo } from 'react'
import networks from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { ChainParams } from '@ui-kit/lib/model/query'
import { useApiStore } from '@ui-kit/shared/useApiStore'
import { useOneWayMarketNames } from './chain-query'

export const useOneWayMarketMapping = (params: ChainParams<ChainId>) => {
  const { chainId } = params
  const { data: marketNames, ...rest } = useOneWayMarketNames(params)
  const llamalend = useApiStore((state) => state.llamalend)
  const isLoadingApi = useApiStore((state) => state.isLoadingLlamalend)
  const apiChainId = llamalend?.chainId
  const data: Record<string, LendMarketTemplate> | undefined = useMemo(
    () =>
      marketNames && llamalend && chainId == apiChainId && !isLoadingApi
        ? Object.fromEntries(
            marketNames
              .filter((marketName) => !networks[chainId!].hideMarketsInUI[marketName])
              .map((name) => [name, llamalend.getLendMarket(name)] as const)
              .flatMap(([name, market]) => [
                [name, market],
                [market.addresses.controller, market],
              ]),
          )
        : undefined,
    [llamalend, apiChainId, chainId, marketNames, isLoadingApi],
  )
  return { data, ...rest }
}

export const useOneWayMarket = (chainId: ChainId, marketName: string) => {
  const { data, ...rest } = useOneWayMarketMapping({ chainId })
  const market = data?.[marketName]
  return { data: market, ...rest }
}
