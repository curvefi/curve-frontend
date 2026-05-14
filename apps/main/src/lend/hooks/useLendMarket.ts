import { useLLv2 } from 'curve-ui-kit/src/hooks/useFeatureFlags'
import { useMemo } from 'react'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useLendMarkets } from '../queries/lend-market-names.query'
import { ChainId } from '../types/lend.types'

export const useLendMarket = (chainId: ChainId, rMarket: string) => {
  const { llamaApi: api } = useCurve()
  const { data, error, isLoading, isSuccess } = useLendMarkets({ chainId, enableLLv2: useLLv2() })
  const market = useMemo(
    () => (api && data && rMarket in data ? api.getLendMarketByData(data[rMarket].id, data[rMarket]) : undefined),
    [api, data, rMarket],
  )
  return { data: market, error, isLoading, isSuccess }
}
