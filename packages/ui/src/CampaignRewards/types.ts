export interface CampaignRewardsItem {
  campaignName: string
  platform: string
  description: string
  platformImageId: string
  dashboardLink: string
  pools: CampaignRewardsPool[]
}

export interface CampaignRewardsPool {
  id: string
  action: RewardsAction
  description: string
  campaignStart: string
  campaignEnd: string
  address: string
  network: string
  multiplier: string
  tags: RewardsTags[]
  lock: string
}

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

export type RewardsTags = 'points' | 'merkle' | 'tokens'
export type RewardsAction = 'supply' | 'borrow' | 'lp' | 'loan'
