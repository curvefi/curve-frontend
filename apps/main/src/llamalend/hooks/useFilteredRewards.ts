import { useMemo } from 'react'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'

const RewardsActionMap = {
  [MarketRateType.Borrow]: {
    [LlamaMarketType.Mint]: 'borrow',
    [LlamaMarketType.Lend]: 'borrow',
  },
  [MarketRateType.Supply]: {
    [LlamaMarketType.Mint]: undefined, // no supply action for mint markets
    [LlamaMarketType.Lend]: 'supply',
  },
} as const

export const useFilteredRewards = (rewards: CampaignRewards[], marketType: LlamaMarketType, rateType: MarketRateType) =>
  useMemo(
    () => rewards.filter(({ action }) => action == RewardsActionMap[rateType][marketType]),
    [rewards, marketType, rateType],
  )
