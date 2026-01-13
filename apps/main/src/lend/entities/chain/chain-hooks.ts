import { useMemo } from 'react'
import { networks } from '@/lend/networks'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { ChainParams } from '@ui-kit/lib/model/query'
import { useOneWayMarketNames } from './chain-query'

export const useOneWayMarketMapping = (params: ChainParams<ChainId>) => {
  const { chainId } = params
  const { data: marketNames, isSuccess, error } = useOneWayMarketNames(params)
  const { llamaApi: api, isHydrated } = useCurve()
  const apiChainId = api?.chainId
  const data: Record<string, OneWayMarketTemplate> | undefined = useMemo(
    () =>
      // note: only during hydration `api` internally retrieves all the markets, and we can call `getOneWayMarket`
      marketNames && api && chainId == apiChainId && isHydrated
        ? Object.fromEntries(
            marketNames
              .filter((marketName) => !networks[chainId!].hideMarketsInUI[marketName])
              .map((name) => [name, api.getLendMarket(name)] as const)
              .flatMap(([name, market]) => [
                [name, market],
                [market.addresses.controller, market],
              ]),
          )
        : undefined,
    [api, apiChainId, chainId, isHydrated, marketNames],
  )
  return { data, isSuccess, error }
}

export const useOneWayMarket = (chainId: ChainId, marketName: string) => {
  const { data: markets, isSuccess, ...rest } = useOneWayMarketMapping({ chainId })
  const market = markets?.[marketName]
  return { data: market, isSuccess: isSuccess && !!markets, ...rest }
}
