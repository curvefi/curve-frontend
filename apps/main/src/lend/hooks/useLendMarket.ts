import { useLLv2 } from 'curve-ui-kit/src/hooks/useFeatureFlags'
import { useMemo } from 'react'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useLendMarkets } from '../queries/lend-markets.query'
import { ChainId } from '../types/lend.types'

export function useLendMarketData(chainId: ChainId, rMarket: string, enabled?: boolean) {
  const { data, error, isSuccess } = useLendMarkets({ chainId, enableLLv2: useLLv2() }, enabled)
  const marketData = useMemo(() => data?.[rMarket], [data, rMarket])
  return { error, isSuccess, data: marketData }
}

export const useLendMarket = (chainId: ChainId, rMarket: string, enabled?: boolean) => {
  const { llamaApi: api } = useCurve()
  const { data, error, isSuccess } = useLendMarketData(chainId, rMarket, enabled)
  const market = useMemo(() => api && data && api.getLendMarketByData(data.id, data), [api, data])
  return { data: market, error, isSuccess: isSuccess && !!api }
}
