import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useMemo } from 'react'
import { chainValidationSuite } from '@/entities/chain/model'
import { checkValidity } from '@/shared/lib/validation'
import { useApi } from './chain-info'
import { useOneWayMarketNames } from './query-hooks'
import networks from '@/networks'

export const useOneWayMarketMapping = (chainId: ChainId) => {
  const chainValid = checkValidity(chainValidationSuite, { chainId }); // extra check to make sure the API is loaded before we use stale market names

  const { data: marketNames, ...rest } = useOneWayMarketNames({ chainId })
  const { data: api } = useApi();
  const data: Record<string, OneWayMarketTemplate> | undefined = useMemo(() =>
    chainValid && marketNames && api ? Object.fromEntries(
      marketNames
        .filter(marketName => !networks[chainId].hideMarketsInUI[marketName])
        .map(name => [name, api.getOneWayMarket(name)])
    ) : undefined, [api, chainId, chainValid, marketNames]
  )
  return { data, ...rest }
}

export const useOneWayMarket = (chainId: ChainId, marketName: string) => {
  const { data, ...rest } = useOneWayMarketMapping(chainId)
  return { data: data?.[marketName], ...rest }
}
