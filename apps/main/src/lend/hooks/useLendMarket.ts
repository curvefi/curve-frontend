import { useCallback, useMemo } from 'react'
import type { LlamaApi } from '@evm-ui/features/connect-wallet'
import { useLlamaQuery } from '@evm-ui/features/connect-wallet/lib/CurveContext'
import { useCombinedQueries } from '@evm-ui/lib'
import { t } from '@evm-ui/lib/i18n'
import { useMappedQuery } from '@evm-ui/types/util'
import { type LendMarketData, useLendMarkets } from '../queries/lend-markets.query'
import { ChainId } from '../types/lend.types'

type MarketUrlParams = { chainId: ChainId; rMarket: string }

function useLendMarketData({ chainId, rMarket }: MarketUrlParams, enabled?: boolean) {
  const lendMarkets = useLendMarkets({ chainId }, enabled)
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
