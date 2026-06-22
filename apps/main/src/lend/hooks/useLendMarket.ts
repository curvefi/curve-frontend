import { useCallback, useMemo } from 'react'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { useMappedQuery } from '@ui-kit/types/util'
import { useLendMarkets } from '../queries/lend-markets.query'
import { ChainId } from '../types/lend.types'

export function useLendMarketData(chainId: ChainId, marketId: string, enabled?: boolean) {
  const lendMarkets = useLendMarkets({ chainId, enableLLv2: useLLv2() }, enabled)
  const lendMarket = useMappedQuery(
    lendMarkets,
    useCallback(data => data?.[marketId], [marketId]),
  )
  const error = useMemo(
    () => lendMarkets.data && !lendMarket.data && new Error(`${t`Market`} ${marketId} ${t`Not Found`}`),
    [lendMarket.data, lendMarkets.data, marketId],
  )
  return { ...lendMarket, ...(error && { error }) }
}

export const useLendMarket = ({ rMarket, chainId }: { chainId: ChainId; rMarket: string }, enabled?: boolean) => {
  const { llamaApi: api } = useCurve()
  return useMappedQuery(
    useLendMarketData(chainId, rMarket, enabled),
    useCallback(data => api && data && api.getLendMarketByData(data.id, data), [api]),
  )
}
