import { useMemo } from 'react'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { ChainParams } from '@ui-kit/lib/model/query'
import { useOneWayMarketNames } from './chain-query'

export const useOneWayMarketMapping = (params: ChainParams<ChainId>) => {
  const { chainId } = params
  const { data: marketNames, ...rest } = useOneWayMarketNames(params)
  const api = useStore((state) => state.api)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const apiChainId = api?.chainId
  const data: Record<string, OneWayMarketTemplate> | undefined = useMemo(
    () =>
      marketNames && api && chainId == apiChainId && !isLoadingApi
        ? Object.fromEntries(
            marketNames
              .filter((marketName) => !networks[chainId!].hideMarketsInUI[marketName])
              .map((name) => [name, api.getOneWayMarket(name)] as const)
              .flatMap(([name, market]) => [
                [name, market],
                [market.addresses.controller, market],
              ]),
          )
        : undefined,
    [api, apiChainId, chainId, marketNames, isLoadingApi],
  )
  return { data, ...rest }
}

export const useOneWayMarket = (chainId: ChainId, marketName: string) => {
  const { data, ...rest } = useOneWayMarketMapping({ chainId })
  const market = data?.[marketName]
  return { data: market, ...rest }
}
