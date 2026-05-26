import { useCurve } from 'curve-ui-kit/src/features/connect-wallet'
import { useLLv2 } from 'curve-ui-kit/src/hooks/useFeatureFlags'
import { ChainParams } from 'curve-ui-kit/src/lib/model/query'
import { useMemo } from 'react'
import { networks } from '../networks'
import { useLendMarketNames } from '../queries/lend-market-names.query'
import { ChainId, LendMarketTemplate } from '../types/lend.types'

const useLendMarketMapping = ({ chainId }: ChainParams<ChainId>) => {
  const { llamaApi: api, isHydrated } = useCurve()
  const { data: marketNames, error, isLoading } = useLendMarketNames({ chainId, enableLLv2: useLLv2() }, isHydrated)
  const data: Record<string, LendMarketTemplate> | undefined = useMemo(
    () =>
      // note: only during hydration `api` internally retrieves all the markets, and we can call `getOneWayMarket`
      marketNames && api
        ? Object.fromEntries(
            marketNames
              .filter(marketName => !networks[chainId!].hideMarketsInUI[marketName])
              .map(name => [name, api.getLendMarket(name)] as const)
              .flatMap(([name, market]) => [
                [name, market],
                [market.addresses.controller, market],
              ]),
          )
        : undefined,
    [api, chainId, marketNames],
  )
  return { data, isSuccess: !!data, error, isLoading }
}

export const useLendMarket = (chainId: ChainId, marketName: string) => {
  const { data: markets, ...rest } = useLendMarketMapping({ chainId })
  return { data: markets?.[marketName], ...rest }
}
