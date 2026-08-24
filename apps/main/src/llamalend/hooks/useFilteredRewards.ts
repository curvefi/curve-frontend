import { useMemo } from 'react'
import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import { MarketType, MarketRateType } from '@evm-ui/types/market'

const RewardsActionMap = {
  [MarketRateType.Borrow]: {
    [MarketType.Mint]: 'borrow',
    [MarketType.Lend]: 'borrow',
  },
  [MarketRateType.Supply]: {
    [MarketType.Mint]: undefined, // no supply action for mint markets
    [MarketType.Lend]: 'supply',
  },
} as const

export const useFilteredRewards = (rewards: CampaignRewards[], marketType: MarketType, rateType: MarketRateType) =>
  useMemo(
    () => rewards.filter(({ action }) => action == RewardsActionMap[rateType][marketType]),
    [rewards, marketType, rateType],
  )
