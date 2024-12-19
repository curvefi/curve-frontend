import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useMemo } from 'react'
import networks from '@/networks'
import useStore from '@/store/useStore'
import { useOneWayMarketNames } from './chain-query'
import { ChainParams } from '@/shared/model/query'

export const useOneWayMarketMapping = (params: ChainParams<ChainId>) => {
  const { chainId } = params
  const { data: marketNames, ...rest } = useOneWayMarketNames(params)
  const api = useStore((state) => state.api)
  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const data: Record<string, OneWayMarketTemplate> | undefined = useMemo(
    () =>
      marketNames && chainId && api && !isLoadingApi
        ? Object.fromEntries(
            marketNames
              .filter((marketName) => !networks[chainId].hideMarketsInUI[marketName])
              .map((name) => [name, api.getOneWayMarket(name)]),
          )
        : undefined,
    [api, chainId, marketNames, isLoadingApi],
  )
  return { data, ...rest }
}

export const useOneWayMarket = (chainId: ChainId, marketName: string) => {
  const { data, ...rest } = useOneWayMarketMapping({ chainId })
  return { data: data?.[marketName], ...rest }
}
