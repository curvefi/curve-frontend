import { useMemo } from 'react'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useMintMarkets } from '../entities/mint-markets.query'
import { ChainId } from '../types/loan.types'

export function useMintMarketData(chainId: ChainId, rMarket: string) {
  const { data, error, isSuccess } = useMintMarkets({ chainId })
  const marketData = useMemo(() => data?.[rMarket], [data, rMarket])
  return { error, isSuccess, data: marketData }
}

export const useMintMarket = (chainId: ChainId, rMarket: string) => {
  const { llamaApi: api } = useCurve()
  const { data, error, isSuccess } = useMintMarketData(chainId, rMarket)
  const market = useMemo(() => api && data && api.getMintMarketByData(data.id, data), [api, data])
  return { data: market, error, isSuccess: isSuccess && !!api }
}
