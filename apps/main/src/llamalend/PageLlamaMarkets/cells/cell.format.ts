import { useMemo } from 'react'
import { PoolRewards } from '@/llamalend/entities/campaigns'
import { LlamaMarketType } from '@/llamalend/entities/llama-markets'
import type { RateType } from '@/llamalend/PageLlamaMarkets/hooks/useSnapshots'

/**
 * Formats a rate as a percentage string with 4 significant digits.
 * @param rate - The rate to format, when null, it defaults to 0 (please do not display this, show Skeleton instead).
 */
export const formatPercent = (rate: number | null) => `${(rate || 0).toFixed(2)}%`

export const useFilteredRewards = (rewards: PoolRewards[], marketType: LlamaMarketType, rateType: RateType) =>
  useMemo(() => {
    const rewardsAction = rateType == 'borrow' ? (marketType === LlamaMarketType.Mint ? 'loan' : 'borrow') : 'supply'
    return rewards.filter(({ action }) => action == rewardsAction)
  }, [rewards, marketType, rateType])
