import { useCallback, useMemo } from 'react'
import type { LlamaApi } from '@ui-kit/features/connect-wallet'
import { useLlamaQuery } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { useCombinedQueries } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { useMappedQuery } from '@ui-kit/types/util'
import { type LendMarketData, useLendMarkets } from '../queries/lend-markets.query'
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

const getLendMarketByData = (data: LendMarketData, api: LlamaApi) => api.getLendMarketByData(data.id, data)

export const useLendMarket = ({ rMarket, chainId }: MarketUrlParams, enabled?: boolean) =>
  useCombinedQueries([useLendMarketData({ chainId, rMarket }, enabled), useLlamaQuery()], getLendMarketByData)
