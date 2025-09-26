import { useMemo } from 'react'
import { PoolRewards } from '@ui-kit/entities/campaigns'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'

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
