import { useMemo } from 'react'
import { PoolRewards } from '@ui-kit/entities/campaigns'
import type { MarketType, MarketRateType } from '@ui-kit/types/market'

/**
 * Formats a rate as a percentage string with 4 significant digits.
 * @param rate - The rate to format, when null, it defaults to 0 (please do not display this, show Skeleton instead).
 */
export const formatPercent = (rate: number | null | undefined) =>
  `${(rate || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`

export const useFilteredRewards = (rewards: PoolRewards[], marketType: MarketType, rateType: MarketRateType) =>
  useMemo(() => {
    const rewardsAction = rateType == 'borrow' ? (marketType === 'mint' ? 'loan' : 'borrow') : 'supply'
    return rewards.filter(({ action }) => action == rewardsAction)
  }, [rewards, marketType, rateType])
