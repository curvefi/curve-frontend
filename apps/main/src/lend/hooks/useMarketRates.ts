import { useMarketOnChainRates } from '@/lend/entities/market-onchain-rate'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'

export function useMarketRates(rChainId: ChainId, rOwmId: string) {
  const { data: onChainData, isLoading: isOnChainLoading } = useMarketOnChainRates({
    chainId: rChainId,
    marketId: rOwmId,
  })
  const ratesResp = useStore((state) => state.markets.ratesMapper[rChainId]?.[rOwmId])

  if (onChainData) {
    return {
      rates: onChainData.rates,
      loading: isOnChainLoading,
      error: '',
    }
  }

  const { rates, error } = ratesResp ?? {}

  return {
    rates,
    loading: typeof ratesResp === 'undefined',
    error,
  }
}
