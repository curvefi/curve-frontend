import { LlamaMarket } from '@/loan/entities/llama-markets'
import { useSnapshots } from '../hooks/useSnapshots'
import { GraphType } from '@/loan/components/PageLlamaMarkets/hooks/useSnapshots'

export const RateCell = ({ market, type }: { market: LlamaMarket; type: GraphType }) => {
  const { rate } = useSnapshots(market, type)
  return rate == null ? '-' : `${(rate * 100).toPrecision(4)}%`
}
