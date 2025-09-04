import { useMemo } from 'react'
import { PoolRewards } from '@ui-kit/entities/campaigns'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { formatNumber } from '@ui-kit/utils'

/** Common percentage formatter across the board for most  */
export const formatPercent = (value: number | null | undefined) =>
  formatNumber(value || 0, {
    unit: 'percentage',
    abbreviate: true,
    // Disregard the precision edge case around 0 and 1 and force using 2 decimals
    minimumFractionDigits: 2,
    maximumSignificantDigits: undefined,
  })

const RewardsActionMap = {
  [MarketRateType.Borrow]: {
    [LlamaMarketType.Mint]: 'loan',
    [LlamaMarketType.Lend]: 'borrow',
  },
  [MarketRateType.Supply]: {
    [LlamaMarketType.Mint]: undefined, // no supply action for mint markets
    [LlamaMarketType.Lend]: 'supply',
  },
} as const

export const useFilteredRewards = (rewards: PoolRewards[], marketType: LlamaMarketType, rateType: MarketRateType) =>
  useMemo(
    () => rewards.filter(({ action }) => action == RewardsActionMap[rateType][marketType]),
    [rewards, marketType, rateType],
  )
