import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useCombinedQueries } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { fakeLoadingQ, useMappedQuery } from '@ui-kit/types/util'
import { useMintMarkets } from '../entities/mint-markets.query'
import { ChainId } from '../types/loan.types'

type MarketUrlParams = { chainId: ChainId; rMarket: string }

function useMintMarketData({ chainId, rMarket }: MarketUrlParams, enabled?: boolean) {
  const mintMarkets = useMintMarkets({ chainId }, enabled)
  const mintMarket = useMappedQuery(
    mintMarkets,
    useCallback(data => data?.[rMarket], [rMarket]),
  )
  const error = useMemo(
    () => mintMarkets.data && !mintMarket.data && new Error(`${t`Market`} ${rMarket} ${t`Not Found`}`),
    [mintMarket.data, mintMarkets.data, rMarket],
  )
  return { ...mintMarket, ...(error && { error }) }
}

export const useMintMarket = ({ rMarket, chainId }: MarketUrlParams, enabled?: boolean) => {
  const { llamaApi: api } = useCurve()
  const { isConnected } = useConnection()
  return useCombinedQueries(
    [useMintMarketData({ chainId, rMarket }, enabled), fakeLoadingQ(!isConnected || api)],
    useCallback(data => api?.getMintMarketByData(data.id, data), [api]),
  )
}
