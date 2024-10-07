import { useApi, useOneWayMarketNames } from '@/entities/chain'
import networks from '@/networks'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useMemo } from 'react'

export const useMarketMapping = (chainId: ChainId) => {
  const { data: marketNames, ...rest } = useOneWayMarketNames({ chainId })
  const { data: api } = useApi();
  const data: Record<string, OneWayMarketTemplate> | undefined = useMemo(() =>
    marketNames && api && Object.fromEntries(
      marketNames
        .filter(name => !networks[chainId].hideMarketsInUI[name])
        .map(name => [name, api.getOneWayMarket(name)])
    ), [api, chainId, marketNames]
  )
  return { data, ...rest }
}
