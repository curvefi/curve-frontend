import { useMemo } from 'react'
import { PoolRewards } from '@ui-kit/entities/campaigns'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'

/**
 * Formats a rate as a percentage string with 4 significant digits.
 * @param rate - The rate to format, when null, it defaults to 0 (please do not display this, show Skeleton instead).
 */
export const formatPercent = (rate: number | null | undefined) =>
  `${(rate || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`

const RewardsActionMap = {
  [MarketRateType.Borrow]: {
    [LlamaMarketType.Mint]: 'loan',
    [LlamaMarketType.Lend]: 'borrow',
  },
  [MarketRateType.Supply]: {
    [LlamaMarketType.Mint]: 'supply',
    [LlamaMarketType.Lend]: 'supply',
  },
} as const

export const useFilteredRewards = (rewards: PoolRewards[], marketType: LlamaMarketType, rateType: MarketRateType) =>
  useMemo(
    () => rewards.filter(({ action }) => action == RewardsActionMap[rateType][marketType]),
    [rewards, marketType, rateType],
  )
