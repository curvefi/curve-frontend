import { useMemo } from 'react'
import networks from '@/lend/networks'
import { type Api, ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { isHydrated } from '@ui-kit/features/connect-wallet/lib/ConnectionContext'
import { ChainParams } from '@ui-kit/lib/model/query'
import { useOneWayMarketNames } from './chain-query'

export const useOneWayMarketMapping = (params: ChainParams<ChainId>) => {
  const { chainId } = params
  const { data: marketNames, ...rest } = useOneWayMarketNames(params)
  const { lib: api, connectState } = useConnection<Api>()
  const apiChainId = api?.chainId
  const data: Record<string, OneWayMarketTemplate> | undefined = useMemo(
    () =>
      // note: only during hydration `api` internally retrieves all the markets, and we can call `getOneWayMarket`
      isHydrated(connectState) && marketNames && api && chainId == apiChainId
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
    [api, apiChainId, chainId, marketNames, connectState],
  )
  return { data, ...rest }
}

export const useOneWayMarket = (chainId: ChainId, marketName: string) => {
  const { data, ...rest } = useOneWayMarketMapping({ chainId })
  const market = data?.[marketName]
  return { data: market, ...rest }
}
