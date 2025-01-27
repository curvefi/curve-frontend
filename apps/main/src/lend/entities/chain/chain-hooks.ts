import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useMemo } from 'react'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { useOneWayMarketNames } from './chain-query'
import { ChainParams } from '@ui-kit/lib/model/query'
import { ChainId } from '@/lend/types/lend.types'

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
              .map((name) => [name, api.getOneWayMarket(name)]),
          )
        : undefined,
    [api, apiChainId, chainId, marketNames, isLoadingApi],
  )
  return { data, ...rest }
}

export const useOneWayMarket = (chainId: ChainId, marketName: string) => {
  const { data, ...rest } = useOneWayMarketMapping({ chainId })
  return { data: data?.[marketName], ...rest }
}
