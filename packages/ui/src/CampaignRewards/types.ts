import type { RewardsAction, RewardsTags } from '@external-rewards'

export interface RewardsPool {
  campaignName: string
  platform: string
  description: string
  platformImageSrc: string
  dashboardLink: string
  id: string
  action: RewardsAction
  campaignStart: string
  campaignEnd: string
  address: string
  network: string
  multiplier: string
  tags: RewardsTags[]
  lock: boolean
}

export type CampaignRewardsMapper = { [poolAddress: string]: RewardsPool[] }

export interface CampaignRewardsCompProps {
  rewardsPool: RewardsPool
  highContrast?: boolean
  mobile?: boolean
  banner?: boolean
}

export interface CampaignRewardsBannerCompProps {
  campaignRewardsPool: RewardsPool[]
  message: string
}
