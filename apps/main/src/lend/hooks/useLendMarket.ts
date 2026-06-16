import { useCallback } from 'react'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { useMappedQuery } from '@ui-kit/types/util'
import { useLendMarkets } from '../queries/lend-markets.query'
import { ChainId } from '../types/lend.types'

export function useLendMarketData(chainId: ChainId, rMarket: string, enabled?: boolean) {
  const lendMarkets = useLendMarkets({ chainId, enableLLv2: useLLv2() }, enabled)
  return {
    ...useMappedQuery(
      lendMarkets,
      useCallback(data => data?.[rMarket], [rMarket]),
    ),
    isSuccess: lendMarkets.isSuccess,
  }
}

export const useLendMarket = (chainId: ChainId, rMarket: string, enabled?: boolean) => {
  const { llamaApi: api } = useCurve()
  const lendMarketData = useLendMarketData(chainId, rMarket, enabled)
  return {
    ...useMappedQuery(
      lendMarketData,
      useCallback(data => api && data && api.getLendMarketByData(data.id, data), [api]),
    ),
    isSuccess: lendMarketData.isSuccess && !!api,
  }
}
