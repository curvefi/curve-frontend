import { useMemo } from 'react'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useMintMarkets } from '../entities/mint-markets.query'
import { ChainId } from '../types/loan.types'

export const useMintMarket = (chainId: ChainId, rMarket: string) => {
  const { llamaApi: api } = useCurve()
  const { data, error, isLoading, isSuccess } = useMintMarkets({ chainId })
  const market = useMemo(
    () => (api && data && rMarket in data ? api.getMintMarketByData(data[rMarket].id, data[rMarket]) : undefined),
    [api, data, rMarket],
  )
  return { data: market, error, isLoading, isSuccess }
}
