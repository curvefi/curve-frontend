import { useMemo } from 'react'
import type { RateType } from '@/loan/components/PageLlamaMarkets/hooks/useSnapshots'
import { PoolRewards } from '@/loan/entities/campaigns'
import { LlamaMarketType } from '@/loan/entities/llama-markets'

/**
 * Formats a rate as a percentage string with 4 significant digits.
 * @param rate - The rate to format, when null, it defaults to 0 (please do not display this, show Skeleton instead).
 */
export const formatPercent = (rate: number | null) => `${(rate || 0).toPrecision(4)}%`
export const formatPercentFixed = (rate: number) => `${rate.toFixed(2)}%`

export const useFilteredRewards = (rewards: PoolRewards[], marketType: LlamaMarketType, rateType: RateType) =>
  useMemo(() => {
    const rewardsAction = rateType == 'borrow' ? (marketType === LlamaMarketType.Mint ? 'loan' : 'borrow') : 'supply'
    return rewards.filter(({ action }) => action == rewardsAction)
  }, [rewards, marketType, rateType])
