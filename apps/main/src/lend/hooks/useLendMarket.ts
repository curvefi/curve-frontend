import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { useCombinedQueries } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { fakeLoadingQ, useMappedQuery } from '@ui-kit/types/util'
import { useLendMarkets } from '../queries/lend-markets.query'
import { ChainId } from '../types/lend.types'

type MarketUrlParams = { chainId: ChainId; rMarket: string }

function useLendMarketData({ chainId, rMarket }: MarketUrlParams, enabled?: boolean) {
  const lendMarkets = useLendMarkets({ chainId, enableLLv2: useLLv2() }, enabled)
  const lendMarket = useMappedQuery(
    lendMarkets,
    useCallback(data => data?.[rMarket], [rMarket]),
  )
  const error = useMemo(
    () => lendMarkets.data && !lendMarket.data && new Error(`${t`Market`} ${rMarket} ${t`Not Found`}`),
    [lendMarket.data, lendMarkets.data, rMarket],
  )
  return { ...lendMarket, ...(error && { error }) }
}

export const useLendMarket = ({ rMarket, chainId }: MarketUrlParams, enabled?: boolean) => {
  const { llamaApi: api } = useCurve()
  const { isConnected } = useConnection()
  return useCombinedQueries(
    [useLendMarketData({ chainId, rMarket }, enabled), fakeLoadingQ(!isConnected || api)],
    useCallback(data => api?.getLendMarketByData(data.id, data), [api]),
  )
}
