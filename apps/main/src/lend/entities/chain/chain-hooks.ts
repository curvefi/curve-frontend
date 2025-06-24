import { useMemo } from 'react'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { ChainParams } from '@ui-kit/lib/model/query'
import { useOneWayMarketNames } from './chain-query'

export const useOneWayMarketMapping = (params: ChainParams<ChainId>) => {
  const { chainId } = params
  const { data: marketNames, isSuccess, error } = useOneWayMarketNames(params)
  const hydratedChainId = useStore((state) => state.hydratedChainId)
  const { llamaApi: api } = useConnection()
  const apiChainId = api?.chainId
  const data: Record<string, OneWayMarketTemplate> | undefined = useMemo(
    () =>
      // note: only during hydration `api` internally retrieves all the markets, and we can call `getOneWayMarket`
      marketNames && api && chainId == apiChainId && hydratedChainId === chainId
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
    [api, apiChainId, chainId, hydratedChainId, marketNames],
  )
  return { data, isSuccess, error }
}

export const useOneWayMarket = (chainId: ChainId, marketName: string) => {
  const { data: markets, isSuccess, ...rest } = useOneWayMarketMapping({ chainId })
  const market = markets?.[marketName]
  return { data: market, isSuccess: isSuccess && !!markets, ...rest }
}
