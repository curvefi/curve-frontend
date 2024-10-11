import { useOneWayMarketNames } from './query-hooks'
import networks from '@/networks'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useMemo } from 'react'
import { useApi } from './chain-info'

export const useOneWayMarketMapping = (chainId: ChainId) => {
  const { data: marketNames, ...rest } = useOneWayMarketNames({ chainId })
  const { data: api } = useApi();
  const data: Record<string, OneWayMarketTemplate> | undefined = useMemo(() =>
    marketNames && api && Object.fromEntries(
      marketNames
        .filter(marketName => !networks[chainId].hideMarketsInUI[marketName])
        .map(name => [name, api.getOneWayMarket(name)])
    ), [api, chainId, marketNames]
  )
  return { data, ...rest }
}

export const useOneWayMarket = (chainId: ChainId, marketName: string) => {
  const { data, ...rest } = useOneWayMarketMapping(chainId)
  return { data: data?.[marketName], ...rest }
}
