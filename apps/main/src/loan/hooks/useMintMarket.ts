import { useCurve } from '@ui-kit/features/connect-wallet'
import { mapQuery } from '@ui-kit/types/util'
import { useMintMarkets } from '../entities/mint-markets.query'
import { ChainId } from '../types/loan.types'

export function useMintMarketData(chainId: ChainId, rMarket: string, enabled?: boolean) {
  const mintMarkets = useMintMarkets({ chainId }, enabled)
  return { ...mapQuery(mintMarkets, data => data?.[rMarket]), isSuccess: mintMarkets.isSuccess }
}

export const useMintMarket = (chainId: ChainId, rMarket: string, enabled?: boolean) => {
  const { llamaApi: api } = useCurve()
  const mintMarketData = useMintMarketData(chainId, rMarket, enabled)
  return {
    ...mapQuery(mintMarketData, data => api && data && api.getMintMarketByData(data.id, data)),
    isSuccess: mintMarketData.isSuccess && !!api,
  }
}
