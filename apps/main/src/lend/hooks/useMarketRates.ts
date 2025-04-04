import { useMarketOnChainRates } from '@/lend/entities/market-onchain-rate'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'

export function useMarketRates(rChainId: ChainId, rOwmId: string) {
  const { data: onChainRates, isLoading: isOnChainLoading } = useMarketOnChainRates({
    chainId: rChainId,
    marketId: rOwmId,
  })
  const ratesResp = useStore((state) => state.markets.ratesMapper[rChainId]?.[rOwmId])

  if (onChainRates) {
    return {
      rates: onChainRates,
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
