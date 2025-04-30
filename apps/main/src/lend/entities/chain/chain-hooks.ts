import { useMemo } from 'react'
import networks from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { ChainParams } from '@ui-kit/lib/model'
import { useApiStore } from '@ui-kit/shared/useApiStore'
import { useOneWayMarketNames } from './chain-query'

export const useOneWayMarketMapping = ({ chainId }: ChainParams<ChainId>) => {
  const { data: marketData, ...rest } = useOneWayMarketNames({ chainId })
  const api = useApiStore((state) => state.lending)
  const isLoadingApi = useApiStore((state) => state.isLoadingLending)
  const apiChainId = api?.chainId
  const data: Record<string, OneWayMarketTemplate> | undefined = useMemo(
    () =>
      marketData && api && chainId == apiChainId && !isLoadingApi
        ? Object.fromEntries(
            marketData.markets
              .filter((marketName) => !networks[chainId!].hideMarketsInUI[marketName])
              .map((name) => [name, api.getOneWayMarket(name)] as const)
              .flatMap(([name, market]) => [
                [name, market],
                [market.addresses.controller, market],
              ]),
          )
        : undefined,
    [api, apiChainId, chainId, isLoadingApi, marketData],
  )
  return { data, ...rest }
}

export const useOneWayMarket = (chainId: ChainId, marketName: string) => {
  const { data, ...rest } = useOneWayMarketMapping({ chainId })
  const market = data?.[marketName]
  return { data: market, ...rest }
}
