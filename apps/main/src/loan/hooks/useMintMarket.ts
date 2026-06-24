import { useCallback, useMemo } from 'react'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { useMappedQuery } from '@ui-kit/types/util'
import { useMintMarkets } from '../entities/mint-markets.query'
import { ChainId } from '../types/loan.types'

function useMintMarketData({ chainId, rMarket }: { chainId: ChainId; rMarket: string }, enabled?: boolean) {
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

export const useMintMarket = ({ rMarket, chainId }: { chainId: ChainId; rMarket: string }, enabled?: boolean) => {
  const { llamaApi: api } = useCurve()
  return useMappedQuery(
    useMintMarketData({ chainId, rMarket }, enabled),
    useCallback(data => api && data && api.getMintMarketByData(data.id, data), [api]),
  )
}
