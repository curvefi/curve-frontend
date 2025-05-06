import { useMemo } from 'react'
import networks from '@/lend/networks'
import { type Api, ChainId } from '@/lend/types/lend.types'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { isHydrated } from '@ui-kit/features/connect-wallet/lib/ConnectionContext'
import { ChainParams } from '@ui-kit/lib/model/query'
import { useOneWayMarketNames } from './chain-query'

export const useOneWayMarketMapping = (params: ChainParams<ChainId>) => {
  const { chainId } = params
  const { data: marketNames, isSuccess, error } = useOneWayMarketNames(params)
  const { lib: api, connectState } = useConnection<Api>()
  const apiChainId = api?.chainId
  const data: Record<string, OneWayMarketTemplate> | undefined = useMemo(
    () =>
      // note: only during hydration `api` internally retrieves all the markets, and we can call `getOneWayMarket`
      isHydrated(connectState) && marketNames && api && chainId == apiChainId
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
    [api, apiChainId, chainId, marketNames, connectState],
  )
  return { data, isSuccess, error }
}

export const useOneWayMarket = (chainId: ChainId, marketName: string) => {
  const { data: markets, isSuccess, ...rest } = useOneWayMarketMapping({ chainId })
  const market = markets?.[marketName]
  return { data: market, isSuccess: !!markets, ...rest }
}
