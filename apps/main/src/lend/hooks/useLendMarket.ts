import { useLLv2 } from 'curve-ui-kit/src/hooks/useFeatureFlags'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { mapQuery } from '@ui-kit/types/util'
import { useLendMarkets } from '../queries/lend-markets.query'
import { ChainId } from '../types/lend.types'

export function useLendMarketData(chainId: ChainId, rMarket: string, enabled?: boolean) {
  const lendMarkets = useLendMarkets({ chainId, enableLLv2: useLLv2() }, enabled)
  return { ...mapQuery(lendMarkets, data => data?.[rMarket]), isSuccess: lendMarkets.isSuccess }
}

export const useLendMarket = (chainId: ChainId, rMarket: string, enabled?: boolean) => {
  const { llamaApi: api } = useCurve()
  const lendMarketData = useLendMarketData(chainId, rMarket, enabled)
  return {
    ...mapQuery(lendMarketData, data => api && data && api.getLendMarketByData(data.id, data)),
    isSuccess: lendMarketData.isSuccess && !!api,
  }
}
